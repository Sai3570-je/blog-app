import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { getPost, deletePost, toggleLike, clearCurrentPost } from '../store/slices/postsSlice';
import { getComments, createComment, deleteComment, clearComments } from '../store/slices/commentsSlice';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Heart, 
  MessageCircle, 
  Clock, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Send,
  MoreHorizontal,
  Share,
  Bookmark
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  
  const { currentPost, isLoading: postLoading, isError: postError, message: postMessage } = useSelector((state) => state.posts);
  const { comments, isLoading: commentsLoading, isError: commentsError } = useSelector((state) => state.comments);
  
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getPost(id));
      dispatch(getComments({ postId: id }));
    }

    return () => {
      dispatch(clearCurrentPost());
      dispatch(clearComments());
    };
  }, [dispatch, id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      await dispatch(toggleLike(currentPost._id)).unwrap();
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleDeletePost = async () => {
    try {
      await dispatch(deletePost(currentPost._id)).unwrap();
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await dispatch(createComment({ 
        postId: currentPost._id, 
        content: commentText.trim() 
      })).unwrap();
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await dispatch(deleteComment(commentId)).unwrap();
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const getUserInitials = (author) => {
    if (!author) return 'U';
    return `${author.firstName?.[0] || ''}${author.lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatContent = (content) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ));
  };

  const isAuthor = currentPost && user && currentPost.author._id === user._id;

  if (postLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
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

  if (postError || !currentPost) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-destructive mb-4">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {postMessage || 'The post you are looking for does not exist or has been removed.'}
        </p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Button>
        
        {isAuthor && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link to={`/edit/${currentPost._id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePost}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Post Content */}
      <article className="space-y-6">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">{currentPost.title}</h1>
          
          {/* Author and Meta Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentPost.author?.avatar} alt={currentPost.author?.username} />
                <AvatarFallback>
                  {getUserInitials(currentPost.author)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {currentPost.author?.firstName} {currentPost.author?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{currentPost.author?.username}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDate(currentPost.createdAt)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {currentPost.readTime || 1} min read
              </div>
            </div>
          </div>

          {/* Tags */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentPost.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Featured Image */}
          {currentPost.image && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={currentPost.image}
                alt={currentPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        <Separator />

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          {formatContent(currentPost.content)}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                currentPost.isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'
              }`}
            >
              <Heart 
                className={`h-5 w-5 ${currentPost.isLiked ? 'fill-current' : ''}`} 
              />
              <span>{currentPost.likesCount || 0} likes</span>
            </Button>

            <div className="flex items-center space-x-2 text-muted-foreground">
              <MessageCircle className="h-5 w-5" />
              <span>{comments.length} comments</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </article>

      <Separator />

      {/* Comments Section */}
      <section id="comments" className="space-y-6">
        <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>

        {/* Add Comment Form */}
        {isAuthenticated ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add a Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {commentText.length}/1000 characters
                  </p>
                  <Button type="submit" disabled={isSubmittingComment || !commentText.trim()}>
                    {isSubmittingComment ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertDescription>
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>{' '}
              to join the conversation and leave a comment.
            </AlertDescription>
          </Alert>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-muted rounded-full"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : commentsError ? (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load comments. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment._id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Comment Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author?.avatar} alt={comment.author?.username} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(comment.author)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{comment.author?.username} • {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Delete Comment Button */}
                      {user && comment.author._id === user._id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteComment(comment._id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="text-sm">
                      {formatContent(comment.content)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No comments yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your thoughts on this post!
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default PostDetail;

