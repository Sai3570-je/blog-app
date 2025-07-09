import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createPost, reset } from '../store/slices/postsSlice';
import aiService from '../services/aiService';
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
  PenTool, 
  Sparkles, 
  X, 
  Plus,
  Eye,
  Save,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';

const createPostSchema = z.object({
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

const CreatePost = () => {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isError, isSuccess, message, lastOperation } = useSelector((state) => state.posts);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      image: '',
    },
  });

  const watchedTitle = watch('title');
  const watchedContent = watch('content');

  useEffect(() => {
    if (isSuccess && lastOperation === 'createPost') {
      toast.success('Post created successfully!');
      navigate('/');
    }

    if (isError) {
      toast.error(message);
    }

    return () => {
      dispatch(reset());
    };
  }, [isSuccess, isError, message, lastOperation, navigate, dispatch]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (watchedContent && watchedContent.length > 50) {
      const excerpt = watchedContent.substring(0, 150) + '...';
      setValue('excerpt', excerpt);
    }
  }, [watchedContent, setValue]);

  const onSubmit = (data) => {
    const postData = {
      ...data,
      tags,
      readTime: Math.ceil(data.content.split(' ').length / 200), // Estimate reading time
    };

    dispatch(createPost(postData));
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

  const handleGetAISuggestions = async () => {
    if (!watchedTitle.trim()) {
      toast.error('Please enter a title first to get AI suggestions');
      return;
    }

    setIsLoadingAI(true);
    try {
      const suggestions = await aiService.suggestContent({
        title: watchedTitle,
        keywords: tags,
      });
      setAiSuggestions(suggestions.suggestions || []);
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to get AI suggestions');
      console.error('AI suggestions error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleUseSuggestion = (suggestion) => {
    const currentContent = watchedContent || '';
    const newContent = currentContent + (currentContent ? '\n\n' : '') + suggestion;
    setValue('content', newContent);
    toast.success('Suggestion added to content!');
  };

  const formatPreviewContent = (content) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <PenTool className="h-8 w-8 mr-3 text-primary" />
              Create New Post
            </h1>
            <p className="text-muted-foreground">Share your thoughts with the world</p>
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
                    Fill in the basic information about your post
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
                    Write your post content. Markdown formatting is supported.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Start writing your amazing post..."
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
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Publish Post
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
                  This is how your post will appear to readers
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
          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Get AI-powered content suggestions for your post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGetAISuggestions}
                disabled={isLoadingAI || !watchedTitle.trim()}
                className="w-full"
                variant="outline"
              >
                {isLoadingAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Content Ideas
                  </>
                )}
              </Button>

              {aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Suggestions:</Label>
                  {aiSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleUseSuggestion(suggestion)}
                    >
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Writing Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Great posts have:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Compelling, descriptive titles</li>
                  <li>• Clear, engaging introductions</li>
                  <li>• Well-structured content</li>
                  <li>• Relevant tags for discoverability</li>
                  <li>• High-quality featured images</li>
                </ul>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Formatting tips:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use line breaks for paragraphs</li>
                  <li>• Keep paragraphs concise</li>
                  <li>• Use descriptive headings</li>
                  <li>• Include examples and stories</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;

