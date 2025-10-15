// src/pages/ViewPost.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Copy, Facebook, Linkedin, Twitter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const ViewPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Format date function
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `https://blog-post-project-api.vercel.app/posts?limit=100`
        );
        
        if (!response.ok) throw new Error('Failed to fetch post');
        
        const data = await response.json();
        const foundPost = data.posts.find(p => p.id === parseInt(postId));
        
        if (foundPost) {
          setPost({
            ...foundPost,
            date: formatDate(foundPost.date)
          });
        } else {
          navigate('/404');
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        navigate('/404');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  // Share on social media
  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/share.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://www.twitter.com/share?&url=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Handle like click (show alert)
  const handleLikeClick = () => {
    setAlertMessage('Please log in to like this article.');
    setShowLoginAlert(true);
  };

  // Handle comment click (show alert)
  const handleCommentClick = () => {
    setAlertMessage('Please log in to comment on this article.');
    setShowLoginAlert(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Login Alert Dialog */}
      {showLoginAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Login Required</h3>
                <p className="text-gray-600 text-sm">{alertMessage}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowLoginAlert(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover:opacity-80">
            Thompson P.
          </Link>
          <div className="flex gap-3">
            <button className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              Log in
            </button>
            <button className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Article Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-[300px] sm:h-[400px] object-cover rounded-lg mb-8"
            />

            {/* Category and Date */}
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-green-600">
                {post.category}
              </span>
              <span className="text-gray-600 text-sm">{post.date}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>

            {/* Description */}
            <p className="text-gray-600 text-lg mb-8">{post.description}</p>

            {/* Content - Using ReactMarkdown */}
            <div className="markdown prose max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Actions Bar */}
            <div className="bg-gray-100 rounded-2xl p-6 mt-12 mb-12">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Like Button */}
                <button
                  onClick={handleLikeClick}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <Heart size={20} />
                  <span className="font-medium">{post.likes}</span>
                </button>

                {/* Share Buttons */}
                <div className="flex items-center gap-3">
                  {/* Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={20} />
                    <span className="font-medium">Copy</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-3 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-3 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>

                  {/* Twitter/X */}
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-3 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Comment</h3>
              <textarea
                placeholder="What are your thoughts?"
                onClick={handleCommentClick}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[150px] resize-y cursor-pointer"
                readOnly
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleCommentClick}
                  className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Author Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-2xl p-6 sticky top-6">
              <h4 className="text-sm font-semibold text-gray-600 mb-4">Author</h4>
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src="https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg"
                  alt={post.author}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="font-bold text-lg">{post.author}</h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mt-4">
                When I'm not writing, I spend time volunteering at my local animal shelter, helping cats find loving homes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewPost;