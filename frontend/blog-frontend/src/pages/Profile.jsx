import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProfile, reset } from '../store/slices/authSlice';
import { getPosts } from '../store/slices/postsSlice';
import PostCard from '../components/blog/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Edit, 
  Save, 
  Loader2, 
  Mail, 
  Calendar,
  MapPin,
  Link as LinkIcon,
  BookOpen,
  Heart,
  MessageCircle,
  Settings
} from 'lucide-react';
import { toast } from 'react-toastify';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  location: z
    .string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),
  website: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  avatar: z
    .string()
    .url('Please enter a valid avatar URL')
    .optional()
    .or(z.literal('')),
});

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);
  const { posts, isLoading: postsLoading } = useSelector((state) => state.posts);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      avatar: user?.avatar || '',
    },
  });

  useEffect(() => {
    if (user) {
      resetForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || '',
      });
    }
  }, [user, resetForm]);

  useEffect(() => {
    // Load user's posts
    if (user) {
      dispatch(getPosts({ 
        page: 1, 
        limit: 20, 
        sort: '-createdAt',
        author: user._id 
      }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    }

    if (isError) {
      toast.error(message);
    }

    return () => {
      dispatch(reset());
    };
  }, [isSuccess, isError, message, dispatch]);

  const onSubmit = (data) => {
    dispatch(updateProfile(data));
  };

  const getUserInitials = (user) => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const userPosts = posts.filter(post => post.author._id === user?._id);
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
  const totalComments = userPosts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-muted-foreground">@{user.username}</p>
                
                {user.bio && (
                  <p className="mt-2 text-sm max-w-md">{user.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </div>
                  
                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {user.location}
                    </div>
                  )}
                  
                  {user.website && (
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      <a 
                        href={user.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{userPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold">{totalLikes}</div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{totalComments}</div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                >
                  {isEditing ? (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {isError && (
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={3}
                  {...register('bio')}
                  className={errors.bio ? 'border-destructive' : ''}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    {...register('location')}
                    className={errors.location ? 'border-destructive' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    {...register('website')}
                    className={errors.website ? 'border-destructive' : ''}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>
              </div>

              {/* Avatar */}
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  {...register('avatar')}
                  className={errors.avatar ? 'border-destructive' : ''}
                />
                {errors.avatar && (
                  <p className="text-sm text-destructive">{errors.avatar.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Profile Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">My Posts</TabsTrigger>
          <TabsTrigger value="liked">Liked Posts</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Posts ({userPosts.length})</h2>
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : userPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6">
                Start sharing your thoughts with the world!
              </p>
              <Button asChild>
                <a href="/create">Write Your First Post</a>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked" className="space-y-6">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Liked Posts</h3>
            <p className="text-muted-foreground">
              Posts you've liked will appear here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
            <p className="text-muted-foreground">
              Your recent comments and interactions will appear here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;

