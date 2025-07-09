import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toggleLike } from '../../store/slices/postsSlice';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Clock, User, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      await dispatch(toggleLike(post._id)).unwrap();
    } catch (error) {
      toast.error('Failed to update like');
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

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 group">
      <CardHeader className="space-y-4">
        {/* Author Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 ring-2 ring-white/50 group-hover:ring-blue-500/50 transition-all duration-300">
            <AvatarImage src={post.author?.avatar} alt={post.author?.username} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              {getUserInitials(post.author)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-blue-600 transition-colors duration-300">
              {post.author?.firstName} {post.author?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              @{post.author?.username}
            </p>
          </div>
          <div className="flex items-center text-xs text-muted-foreground bg-white/50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3 mr-1" />
            {formatDate(post.createdAt)}
          </div>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="aspect-video rounded-md overflow-hidden bg-muted relative group-hover:shadow-lg transition-all duration-300">
            {!imageError ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <div className="animate-pulse flex flex-col items-center space-y-2">
                      <ImageIcon className="h-8 w-8 text-blue-500" />
                      <span className="text-xs text-blue-600">Loading...</span>
                    </div>
                  </div>
                )}
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  style={{ display: imageLoading ? 'none' : 'block' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="text-center space-y-2">
                  <ImageIcon className="h-12 w-12 text-blue-500 mx-auto" />
                  <p className="text-xs text-blue-600">Image unavailable</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Title */}
        <Link to={`/post/${post._id}`}>
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-0 hover:from-blue-200 hover:to-purple-200 transition-all duration-300"
              >
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-300">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Read Time */}
        <div className="flex items-center text-xs text-muted-foreground bg-white/50 dark:bg-gray-700/50 px-3 py-1 rounded-full w-fit">
          <Clock className="h-3 w-3 mr-1" />
          {post.readTime || 1} min read
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-white/20">
        <div className="flex items-center justify-between w-full">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-all duration-300 hover:scale-105 ${
              post.isLiked 
                ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20' 
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <Heart 
              className={`h-4 w-4 transition-all duration-300 ${post.isLiked ? 'fill-current scale-110' : ''}`} 
            />
            <span className="text-sm font-medium">{post.likesCount || 0}</span>
          </Button>

          {/* Comments */}
          <Link to={`/post/${post._id}#comments`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{post.commentsCount || 0}</span>
            </Button>
          </Link>

          {/* Read More */}
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" 
            asChild
          >
            <Link to={`/post/${post._id}`}>
              Read More
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;

