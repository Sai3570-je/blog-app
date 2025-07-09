import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getPost, updatePost, reset, clearCurrentPost } from '../store/slices/postsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Edit, 
  X, 
  Plus,
  Eye,
  Save,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';

const editPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(50000, 'Content cannot exceed 50,000 characters'),
  excerpt: z
    .string()
    .max(500, 'Excerpt cannot exceed 500 characters')
    .optional(),
  image: z
    .string()
    .url('Please enter a valid image URL')
    .optional()
    .or(z.literal('')),
});

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentPost, isLoading, isError, isSuccess, message } = useSelector((state) => state.posts);
  
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset: resetForm,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editPostSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      image: '',
    },
  });

  const watchedTitle = watch('title');
  const watchedContent = watch('content');

  // Load post data
  useEffect(() => {
    if (id) {
      dispatch(getPost(id));
    }

    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, id]);

  // Initialize form with post data
  useEffect(() => {
    if (currentPost && !isInitialized) {
      resetForm({
        title: currentPost.title || '',
        content: currentPost.content || '',
        excerpt: currentPost.excerpt || '',
        image: currentPost.image || '',
      });
      setTags(currentPost.tags || []);
      setIsInitialized(true);
    }
  }, [currentPost, resetForm, isInitialized]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Post updated successfully!');
      navigate(`/post/${id}`);
    }

    if (isError) {
      toast.error(message);
    }

    return () => {
      dispatch(reset());
    };
  }, [isSuccess, isError, message, navigate, dispatch, id]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (watchedContent && watchedContent.length > 50 && isInitialized) {
      const excerpt = watchedContent.substring(0, 150) + '...';
      setValue('excerpt', excerpt);
    }
  }, [watchedContent, setValue, isInitialized]);

  const onSubmit = (data) => {
    const postData = {
      ...data,
      tags,
      readTime: Math.ceil(data.content.split(' ').length / 200),
    };

    dispatch(updatePost({ postId: id, postData }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatPreviewContent = (content) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ));
  };

  // Loading state
  if (isLoading && !currentPost) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && !currentPost) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-destructive mb-4">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The post you are trying to edit does not exist or you don't have permission to edit it.
        </p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(`/post/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Post
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Edit className="h-8 w-8 mr-3 text-primary" />
              Edit Post
            </h1>
            <p className="text-muted-foreground">Update your post content</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {!isPreview ? (
            /* Edit Mode */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post Details</CardTitle>
                  <CardDescription>
                    Update the basic information about your post
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isError && (
                    <Alert variant="destructive">
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter an engaging title for your post..."
                      {...register('title')}
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="image">Featured Image URL</Label>
                    <Input
                      id="image"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      {...register('image')}
                      className={errors.image ? 'border-destructive' : ''}
                    />
                    {errors.image && (
                      <p className="text-sm text-destructive">{errors.image.message}</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Press Enter or click + to add tags. Maximum 10 tags.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>
                    Update your post content. Markdown formatting is supported.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Update your post content..."
                      rows={15}
                      {...register('content')}
                      className={errors.content ? 'border-destructive' : ''}
                    />
                    {errors.content && (
                      <p className="text-sm text-destructive">{errors.content.message}</p>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{watchedContent?.length || 0} characters</span>
                      <span>~{Math.ceil((watchedContent?.split(' ').length || 0) / 200)} min read</span>
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief description of your post (auto-generated from content)"
                      rows={3}
                      {...register('excerpt')}
                      className={errors.excerpt ? 'border-destructive' : ''}
                    />
                    {errors.excerpt && (
                      <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      This will be shown in post previews and search results
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate(`/post/${id}`)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* Preview Mode */
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  This is how your updated post will appear to readers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview Header */}
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold">{watchedTitle || 'Untitled Post'}</h1>
                  
                  {watch('image') && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={watch('image')}
                        alt={watchedTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <span>~{Math.ceil((watchedContent?.split(' ').length || 0) / 200)} min read</span>
                    <span>{watchedContent?.length || 0} characters</span>
                  </div>
                </div>

                <Separator />

                {/* Preview Content */}
                <div className="prose prose-gray max-w-none">
                  {watchedContent ? (
                    formatPreviewContent(watchedContent)
                  ) : (
                    <p className="text-muted-foreground italic">
                      Start writing to see your content preview...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {currentPost && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(currentPost.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span>{new Date(currentPost.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Likes:</span>
                    <span>{currentPost.likesCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comments:</span>
                    <span>{currentPost.commentsCount || 0}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Editing Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Editing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Before publishing:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Review your content for clarity</li>
                  <li>• Check spelling and grammar</li>
                  <li>• Ensure tags are relevant</li>
                  <li>• Verify image URLs work</li>
                  <li>• Preview how it looks</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">SEO tips:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use descriptive titles</li>
                  <li>• Write compelling excerpts</li>
                  <li>• Add relevant tags</li>
                  <li>• Include quality images</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditPost;

