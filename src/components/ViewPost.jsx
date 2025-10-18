import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Facebook,
  Linkedin,
  Twitter,
  SmilePlus,
  Copy,
  Loader2,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mock data
const comments = [
  {
    id: 1,
    name: "Sarah Johnson",
    date: "2 days ago",
    comment: "Great article! I really enjoyed reading about this topic. The insights shared here are very valuable.",
    image: "https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg"
  },
  {
    id: 2,
    name: "Mike Peterson",
    date: "1 week ago",
    comment: "This is exactly what I was looking for. Thanks for sharing your expertise on this subject!",
    image: "https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg"
  },
  {
    id: 3,
    name: "Emma Wilson",
    date: "2 weeks ago",
    comment: "Very informative and well-written. I'll definitely be sharing this with my colleagues.",
    image: "https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg"
  }
];

const authorImage = "https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg";

export default function ViewPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [likes, setLikes] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const getPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://blog-post-project-api.vercel.app/posts/${postId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        
        const data = await response.json();
        setPost(data);
        setLikes(data.likes || 0);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (postId) {
      getPost();
    }
  }, [postId]);

  const handleBack = () => {
    navigate('/');
  };

  const handleLike = () => {
    setLikes(prev => prev + 1);
  };

  const handleShowToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">
            {error || 'Failed to load article'}
          </p>
          <button 
            onClick={handleBack}
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
      <div className="lg:hidden w-full h-64 relative mb-6">
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-6 relative">
        <div className="hidden lg:block mb-6">
          <div className="w-full h-96 relative rounded-2xl overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-green-100 rounded-full px-3 py-1 text-xs font-semibold text-green-700">
                  {post.category}
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

              <div className="prose prose-sm max-w-none">
                <div className="text-gray-700 space-y-3 text-sm leading-relaxed">
                  {post.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={idx} className="text-lg font-bold mt-5 mb-2 text-gray-900">{paragraph.replace('## ', '')}</h2>;
                    } else if (paragraph.startsWith('### ')) {
                      return <h3 key={idx} className="text-base font-bold mt-4 mb-2 text-gray-900">{paragraph.replace('### ', '')}</h3>;
                    } else if (paragraph.startsWith('- ')) {
                      const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1 mb-3 ml-2">
                          {items.map((item, i) => (
                            <li key={i} className="text-sm">{item.replace('- ', '')}</li>
                          ))}
                        </ul>
                      );
                    } else if (paragraph.trim()) {
                      return <p key={idx} className="leading-relaxed text-sm">{paragraph}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>

            <div className="lg:hidden mb-5">
              <AuthorBio />
            </div>

            <Share likes={likes} onLike={handleLike} onShowToast={handleShowToast} />

            <Comment 
              commentText={commentText} 
              setCommentText={setCommentText}
              isLoggedIn={isLoggedIn}
              onShowAuthDialog={() => setShowAuthDialog(true)}
            />
          </div>

          <div className="hidden lg:block lg:w-1/3">
            <div className="sticky top-24">
              <AuthorBio />
            </div>
          </div>
        </div>
      </div>

      <div className="h-8"></div>

      {/* Custom Toast Notification */}
     {showToast && (
  <div className="fixed bottom-6 right-6 z-50">
    <div className="bg-green-500 text-white rounded-xl shadow-lg px-6 py-4 flex items-center gap-3 min-w-[320px]">
      <div className="flex-1">
        <p className="font-bold text-base mb-1">Copied!</p>
        <p className="text-sm">This article has been copied to your clipboard.</p>
      </div>
      <button
        onClick={() => setShowToast(false)}
        className="text-white hover:text-gray-200 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
)}

      {/* Auth Dialog */}
{/* Auth Dialog */}
<AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
  <AlertDialogContent className="sm:max-w-[450px] rounded-3xl bg-white">
    <button
      onClick={() => setShowAuthDialog(false)}
      className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none text-gray-900"
    >
      <X className="h-5 w-5" />
      <span className="sr-only">Close</span>
    </button>
    
<div className="flex flex-col items-center text-center pt-8 pb-4 px-4 sm:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Create an account to<br />continue
      </h2>
      
      <button
        onClick={() => {
          setShowAuthDialog(false);
          navigate('/signup');
        }}
        className="w-full sm:w-auto bg-black text-white py-3 px-10 rounded-full font-medium hover:bg-gray-800 transition-colors mb-6 text-sm"
      >
        Create account
      </button>
      
      <p className="text-sm sm:text-base text-gray-600">
        Already have an account?{" "}
        <button 
          onClick={() => {
            setShowAuthDialog(false);
            navigate('/login');
          }}
          className="text-black font-semibold underline hover:no-underline"
        >
          Log in
        </button>
      </p>
    </div>
  </AlertDialogContent>
</AlertDialog>
    </div>
  );
}

function Share({ likes, onLike, onShowToast }) {
  const shareLink = encodeURIComponent(window.location.href);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    onShowToast();
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = (platform) => {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`,
      twitter: `https://twitter.com/intent/tweet?url=${shareLink}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="bg-[#EFEEEB] rounded-xl shadow-sm p-4 mb-5">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <button 
          onClick={onLike}
          className="bg-gray-50 flex items-center justify-center gap-2 px-5 py-2 rounded-full text-gray-900 border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all text-sm font-medium"
        >
          <SmilePlus className="w-4 h-4" />
          <span>{likes}</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="bg-gray-50 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-gray-900 border border-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all text-sm font-medium flex-1 sm:flex-none"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          <button
            onClick={() => handleShare('facebook')}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full text-white transition-colors"
            aria-label="Share on Facebook"
          >
            <Facebook className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleShare('linkedin')}
            className="bg-blue-700 hover:bg-blue-800 p-2 rounded-full text-white transition-colors"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleShare('twitter')}
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

function Comment({ commentText, setCommentText, isLoggedIn, onShowAuthDialog }) {
  const handleSubmit = () => {
    if (!isLoggedIn) {
      onShowAuthDialog();
      return;
    }
    
    if (commentText.trim()) {
      console.log("Comment submitted:", commentText);
      setCommentText("");
    }
  };

  return (
    <div className="mb-5">
      <div className="mb-5">
        <h3 className="text-base font-bold text-gray-900 mb-2.5">Leave a Comment</h3>
        <div className="space-y-2">
          <textarea
            placeholder="What are your thoughts?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-gray-900 transition-colors h-20 text-sm"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleSubmit}
              className="px-5 py-1.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">
          Comments ({comments.length})
        </h3>
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 pb-3 border-b border-gray-200 last:border-b-0">
              <img
                src={comment.image}
                alt={comment.name}
                className="rounded-full w-9 h-9 object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{comment.name}</h4>
                  <span className="text-xs text-gray-500">{comment.date}</span>
                </div>
                <p className="text-gray-600 leading-relaxed text-xs">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthorBio() {
  return (
    <div className="bg-[#EFEEEB] rounded-xl p-4 shadow-sm border border-[#EFEEEB]">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 ring-2 ring-[#DAD6D1]">
          <img
            src={authorImage}
            alt="Thompson P."
            className="object-cover w-12 h-12"
          />
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">Author</p>
          <h3 className="text-base font-bold text-gray-900">Thompson P.</h3>
        </div>
      </div>
      <hr className="border-[#DAD6D1] mb-3" />
      <div className="text-gray-700 space-y-2 text-xs leading-relaxed">
        <p>
          I am a pet enthusiast and freelance writer who specializes in animal
          behavior and care. With a deep love for cats, I enjoy sharing insights
          on feline companionship and wellness.
        </p>
        <p>
          When I'm not writing, I spend time volunteering at my local animal
          shelter, helping cats find loving homes.
        </p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F9F8F6]">
      <div className="flex flex-col items-center">
        <Loader2 className="w-16 h-16 animate-spin text-gray-900" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading article...</p>
      </div>
    </div>
  );
}