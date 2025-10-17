import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Facebook,
  Linkedin,
  Twitter,
  SmilePlus,
  Copy,
  Loader2,
  ArrowLeft,
} from "lucide-react";

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image with Overlay */}
      <div className="w-full h-64 sm:h-80 lg:h-96 relative">
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-gray-200 transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content */}
          <div className="xl:w-3/4">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10 mb-8">
              {/* Category and Date */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-green-100 rounded-full px-4 py-1.5 text-sm font-semibold text-green-700">
                  {post.category}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Description */}
              <p className="text-gray-700 text-lg leading-relaxed mb-8 pb-8 border-b border-gray-200">
                {post.description}
              </p>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <div className="text-gray-700 space-y-4">
                  {post.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={idx} className="text-3xl font-bold mt-8 mb-4 text-gray-900">{paragraph.replace('## ', '')}</h2>;
                    } else if (paragraph.startsWith('### ')) {
                      return <h3 key={idx} className="text-2xl font-bold mt-6 mb-3 text-gray-900">{paragraph.replace('### ', '')}</h3>;
                    } else if (paragraph.startsWith('- ')) {
                      const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-2 mb-4">
                          {items.map((item, i) => (
                            <li key={i}>{item.replace('- ', '')}</li>
                          ))}
                        </ul>
                      );
                    } else if (paragraph.trim()) {
                      return <p key={idx} className="leading-relaxed">{paragraph}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>

            {/* Author Bio - Mobile */}
            <div className="xl:hidden mb-8">
              <AuthorBio />
            </div>

            {/* Share Section */}
            <Share likes={likes} onLike={handleLike} />

            {/* Comments Section */}
            <Comment commentText={commentText} setCommentText={setCommentText} />
          </div>

          {/* Sidebar - Desktop */}
          <div className="hidden xl:block xl:w-1/4">
            <div className="sticky top-8">
              <AuthorBio />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-16"></div>
    </div>
  );
}

function Share({ likes, onLike }) {
  const shareLink = encodeURIComponent(window.location.href);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Like Button */}
        <button 
          onClick={onLike}
          className="bg-gray-100 flex items-center justify-center gap-2 px-8 py-3 rounded-full text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all group"
        >
          <SmilePlus className="w-5 h-5" />
          <span className="font-semibold">{likes}</span>
        </button>

        {/* Share Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="bg-gray-100 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all flex-1 sm:flex-none"
          >
            <Copy className="w-5 h-5" />
            <span className="font-medium">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          <button
            onClick={() => handleShare('facebook')}
            className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full text-white transition-colors border-2 border-blue-600"
            aria-label="Share on Facebook"
          >
            <Facebook className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => handleShare('linkedin')}
            className="bg-blue-700 hover:bg-blue-800 p-3 rounded-full text-white transition-colors border-2 border-blue-700"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => handleShare('twitter')}
            className="bg-sky-500 hover:bg-sky-600 p-3 rounded-full text-white transition-colors border-2 border-sky-500"
            aria-label="Share on Twitter"
          >
            <Twitter className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Comment({ commentText, setCommentText }) {
  const handleSubmit = () => {
    if (commentText.trim()) {
      console.log("Comment submitted:", commentText);
      setCommentText("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
      {/* Comment Form */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Leave a Comment</h3>
        <div className="space-y-3">
          <textarea
            placeholder="What are your thoughts?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-gray-900 transition-colors h-32"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleSubmit}
              className="px-8 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Comments ({comments.length})
        </h3>
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-b-0">
              <img
                src={comment.image}
                alt={comment.name}
                className="rounded-full w-12 h-12 object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                  <span className="text-sm text-gray-500">{comment.date}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
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
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-amber-100">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 ring-2 ring-amber-200">
          <img
            src={authorImage}
            alt="Thompson P."
            className="object-cover w-16 h-16"
          />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">Author</p>
          <h3 className="text-2xl font-bold text-gray-900">Thompson P.</h3>
        </div>
      </div>
      <hr className="border-amber-200 mb-4" />
      <div className="text-gray-700 space-y-3 text-sm leading-relaxed">
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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <Loader2 className="w-16 h-16 animate-spin text-gray-900" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading article...</p>
      </div>
    </div>
  );
}