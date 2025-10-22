import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Facebook,
  Linkedin,
  Twitter,
  Heart,
  Copy,
  Loader2,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/lib/supabase";
import { notificationService } from "@/services/notificationService";

// Custom toast functions
const toastSuccess = (message, description = "") => {
  sonnerToast.success(message, {
    description,
    duration: 4000,
    position: "top-center",
    style: {
      background: '#12B279',
      color: 'white',
      border: 'none',
    },
    classNames: {
      description: '!text-white',
      closeButton: '!bg-transparent !text-white hover:!bg-white/10 !absolute !right-1 !left-auto !top-4',
    },
    closeButton: true,
  });
};

const toastError = (message) => {
  sonnerToast.error(message, {
    duration: 4000,
    position: "top-center",
  });
};

export default function ViewPost() {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isLiking, setIsLiking] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch post and comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch article
        const { data: postData, error: postError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', postId)
          .single();

        if (postError) throw postError;
        if (!postData) throw new Error('Article not found');

        setPost(postData);

        // Fetch comments with user data
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            users (
              id,
              name,
              username,
              avatar_url
            )
          `)
          .eq('article_id', postId)
          .order('created_at', { ascending: false });

        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
        } else {
          setComments(commentsData || []);
        }

        // Fetch likes count
        const { count: likesCount, error: likesError } = await supabase
          .from('likes')
          .select('id', { count: 'exact', head: true })
          .eq('article_id', postId);

        if (!likesError) {
          setLikes(likesCount || 0);
        }

        // Check if user has liked
        if (user) {
          const { data: userLikeData, error: userLikeError } = await supabase
            .from('likes')
            .select('id')
            .eq('article_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (!userLikeError) {
            setUserLiked(!!userLikeData);
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || "Failed to load article");
        toastError("Failed to load article");
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }
  }, [postId, user]);

  const handleLike = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    try {
      setIsLiking(true);
      
      if (userLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('article_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setLikes((prev) => prev - 1);
        setUserLiked(false);
        toastSuccess("Like removed");
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert([{
            article_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;

        setLikes((prev) => prev + 1);
        setUserLiked(true);
        toastSuccess("Post liked!");

        // Get user data for notification
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single();

        const likerName = userData?.name || user.email;

        // Create notification for article author
        await notificationService.notifyNewLike(
          postId,
          user.id,
          likerName,
          post.title
        );

        console.log("Notification created for new like");
      }
    } catch (err) {
      console.error("Error updating like:", err);
      toastError("Failed to update like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!commentText.trim()) {
      toastError("Comment cannot be empty");
      return;
    }

    try {
      setIsSubmittingComment(true);

      if (editingCommentId) {
        // Update existing comment
        const { error } = await supabase
          .from('comments')
          .update({ 
            comment_text: commentText,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCommentId);

        if (error) throw error;

        // Update local state
        setComments((prev) =>
          prev.map((c) =>
            c.id === editingCommentId ? { ...c, comment_text: commentText } : c
          )
        );
        toastSuccess("Comment updated");
        setEditingCommentId(null);
      } else {
        // Create new comment
        const { data: newComment, error } = await supabase
          .from('comments')
          .insert([{
            article_id: postId,
            user_id: user.id,
            comment_text: commentText,
            created_at: new Date().toISOString()
          }])
          .select(`
            *,
            users (
              id,
              name,
              username,
              avatar_url
            )
          `)
          .single();

        if (error) throw error;

        // Add to local state
        setComments((prev) => [newComment, ...prev]);
        toastSuccess("Comment posted!");

        // Get user data for notification
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          throw userError;
        }

        const commenterName = userData?.name || user.email;

        // Create notifications
        await notificationService.notifyNewComment(
          postId,
          user.id,
          commenterName,
          post.title
        );

        console.log("Notifications created for new comment");
      }

      setCommentText("");
    } catch (err) {
      console.error("Error posting comment:", err);
      toastError("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setCommentText(comment.comment_text);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toastSuccess("Comment deleted");
    } catch (err) {
      console.error("Error deleting comment:", err);
      toastError("Failed to delete comment");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toastSuccess("Link copied to clipboard");
    } catch (err) {
      console.error("Error copying link:", err);
      toastError("Failed to copy link");
    }
  };

  const handleShare = (platform) => {
    const shareLink = encodeURIComponent(window.location.href);
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`,
      twitter: `https://twitter.com/intent/tweet?url=${shareLink}&text=${encodeURIComponent(
        post?.title || ""
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`,
    };

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            {error || "Failed to load article"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Hero Image */}
      <div className="lg:hidden w-full h-64 relative mb-6">
        <img
          src={post.thumbnail}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-6 relative">
        {/* Desktop Hero Image */}
        <div className="hidden lg:block mb-6">
          <div className="w-full h-96 relative rounded-2xl overflow-hidden">
            <img
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Header */}
            <div className="mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-green-100 rounded-full px-3 py-1 text-xs font-semibold text-green-700">
                  {post.category || "Uncategorized"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {post.title}
              </h1>

              <p className="text-gray-600 text-sm leading-relaxed mb-5 pb-5 border-b border-gray-200">
                {post.description}
              </p>

              {/* Content */}
              <div 
                className="prose prose-sm max-w-none text-gray-700 space-y-3 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Mobile Author Bio */}
            <div className="lg:hidden mb-5">
              <AuthorBio author={post} />
            </div>

            {/* Share & Like Section */}
            <ShareSection
              likes={likes}
              userLiked={userLiked}
              onLike={handleLike}
              onCopyLink={handleCopyLink}
              onShare={handleShare}
              isLiking={isLiking}
            />

            {/* Comments Section */}
            <CommentsSection
              comments={comments}
              commentText={commentText}
              setCommentText={setCommentText}
              isLoggedIn={!!user && !authLoading}
              onShowAuthDialog={() => setShowAuthDialog(true)}
              onSubmit={handleCommentSubmit}
              isSubmitting={isSubmittingComment}
              editingCommentId={editingCommentId}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onCancelEdit={() => {
                setEditingCommentId(null);
                setCommentText("");
              }}
              currentUserId={user?.id}
            />
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="sticky top-24">
              <AuthorBio author={post} />
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      {showAuthDialog && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAuthDialog(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-sm w-full p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthDialog(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center leading-tight">
              Create an account to continue
            </h2>

            <div className="flex justify-center mb-5">
              <button
                onClick={() => {
                  setShowAuthDialog(false);
                  window.scrollTo(0, 0);
                  navigate("/signup");
                }}
                className="bg-gray-900 text-white font-semibold py-2.5 px-8 rounded-full hover:bg-gray-800 transition-colors text-sm"
              >
                Create account
              </button>
            </div>

            <div className="text-center">
              <span className="text-gray-600 text-sm">
                Already have an account?{" "}
              </span>
              <button
                onClick={() => {
                  setShowAuthDialog(false);
                  window.scrollTo(0, 0);
                  navigate("/login");
                }}
                className="text-gray-900 font-semibold text-sm hover:underline"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareSection({
  likes,
  userLiked,
  onLike,
  onCopyLink,
  onShare,
  isLiking,
}) {
  return (
    <div className="bg-[#EFEEEB] rounded-xl shadow-sm p-4 mb-5">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <button
          onClick={onLike}
          disabled={isLiking}
          className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all disabled:opacity-50 ${
            userLiked
              ? "bg-red-500 text-white"
              : "bg-gray-50 text-gray-900 border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900"
          }`}
        >
          <Heart className={`w-4 h-4 ${userLiked ? "fill-current" : ""}`} />
          <span>{likes}</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onCopyLink}
            className="bg-gray-50 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-gray-900 border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all text-sm font-medium flex-1 sm:flex-none"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>

          <button
            onClick={() => onShare("facebook")}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full text-white transition-colors"
            aria-label="Share on Facebook"
          >
            <Facebook className="h-4 w-4" />
          </button>

          <button
            onClick={() => onShare("linkedin")}
            className="bg-blue-700 hover:bg-blue-800 p-2 rounded-full text-white transition-colors"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </button>

          <button
            onClick={() => onShare("twitter")}
            className="bg-sky-500 hover:bg-sky-600 p-2 rounded-full text-white transition-colors"
            aria-label="Share on Twitter"
          >
            <Twitter className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentsSection({
  comments,
  commentText,
  setCommentText,
  isLoggedIn,
  onShowAuthDialog,
  onSubmit,
  isSubmitting,
  editingCommentId,
  onEdit,
  onDelete,
  onCancelEdit,
  currentUserId,
}) {
  const handleTextareaClick = () => {
    if (!isLoggedIn) {
      onShowAuthDialog();
    }
  };

  return (
    <div className="mb-5">
      {/* New Comment Form */}
      <div className="mb-5">
        <h3 className="text-base font-bold text-gray-900 mb-2.5">
          Leave a Comment
        </h3>
        <div className="space-y-2">
          <textarea
            placeholder="What are your thoughts?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onClick={handleTextareaClick}
            disabled={!isLoggedIn}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-gray-900 transition-colors h-20 text-sm disabled:bg-gray-50 disabled:cursor-pointer"
          />
          <div className="flex justify-end items-center">
            {editingCommentId && (
              <button
                onClick={onCancelEdit}
                className="px-4 py-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium mr-2"
              >
                Cancel
              </button>
            )}
            <button
              onClick={isLoggedIn ? onSubmit : handleTextareaClick}
              disabled={isSubmitting || (isLoggedIn && !commentText.trim())}
              className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isSubmitting
                ? "Posting..."
                : editingCommentId
                ? "Update"
                : "Send"}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">
          Comments ({comments.length})
        </h3>
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment, currentUserId, onEdit, onDelete }) {
  const isOwnComment = comment.user_id === currentUserId;

  const getUserAvatar = () => {
    if (comment.users?.avatar_url) {
      return comment.users.avatar_url;
    }
    const userName = comment.users?.name || "Anonymous";
    return `https://ui-avatars.com/api/?name=${userName.charAt(0)}&background=12B279&color=fff&size=200`;
  };

  return (
    <div className="flex gap-3 pb-3 border-b border-gray-200 last:border-b-0">
      <img
        src={getUserAvatar()}
        alt={comment.users?.name || "Anonymous"}
        className="rounded-full w-9 h-9 object-cover flex-shrink-0"
        onError={(e) => {
          const userName = comment.users?.name || "Anonymous";
          e.target.src = `https://ui-avatars.com/api/?name=${userName.charAt(0)}&background=12B279&color=fff&size=200`;
        }}
      />
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 mb-1">
          <h4 className="font-semibold text-gray-900 text-sm">
            {comment.users?.name || "Anonymous"}
          </h4>
          {comment.users?.username && (
            <span className="text-xs text-gray-500">
              @{comment.users.username}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed text-xs">
          {comment.comment_text}
        </p>

        {isOwnComment && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onEdit(comment)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthorBio({ author }) {
  const [authorData, setAuthorData] = useState({
    name: author?.author_name || "Unknown",
    username: "",
    avatar: null
  });

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!author?.user_id) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, username, avatar_url')
          .eq('id', author.user_id)
          .single();

        if (error) {
          console.error('Error fetching author:', error);
          return;
        }

        setAuthorData({
          name: data.name || author.author_name,
          username: data.username || "",
          avatar: data.avatar_url
        });
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchAuthorData();
  }, [author]);

  return (
    <div className="bg-[#EFEEEB] rounded-xl p-4 shadow-sm border border-[#EFEEEB]">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 ring-2 ring-[#DAD6D1]">
          <img
            src={authorData.avatar || `https://ui-avatars.com/api/?name=${authorData.name?.charAt(0)}&background=12B279&color=fff&size=200`}
            alt={authorData.name}
            className="object-cover w-12 h-12"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${authorData.name?.charAt(0)}&background=12B279&color=fff&size=200`;
            }}
          />
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">Author</p>
          <h3 className="text-base font-bold text-gray-900">{authorData.name}</h3>
          {authorData.username && (
            <p className="text-xs text-gray-500">@{authorData.username}</p>
          )}
        </div>
      </div>
      <hr className="border-[#DAD6D1] mb-3" />
      <div className="text-gray-700 space-y-2 text-xs leading-relaxed">
        <p>I am a writer sharing insights and experiences.</p>
        <p>I enjoy creating content that informs and inspires readers.</p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F9F8F6]">
      <div className="flex flex-col items-center">
        <Loader2 className="w-16 h-16 animate-spin text-gray-900" />
        <p className="mt-4 text-lg font-semibold text-gray-700">
          Loading article...
        </p>
      </div>
    </div>
  );
}