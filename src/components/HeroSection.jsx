import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-8 lg:py-12">
      <div className="px-8 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center">
          {/* Left Content */}
          <div className="flex-shrink-0 text-center lg:text-right lg:pr-6 max-w-lg">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6 whitespace-nowrap">
              Stay<br />
              Informed,<br />
              Stay Inspired
            </h1>
            <p className="text-gray-600 text-base lg:text-lg leading-relaxed whitespace-normal">
              Discover a World of Knowledge at Your Fingertips. Your Daily Dose of Inspiration and Information.
            </p>
          </div>

          {/* Center Image */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src="https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg"
                alt="Thompson P. with cat"
                className="rounded-3xl shadow-2xl w-[380px] lg:w-[420px] h-[500px] lg:h-[600px] object-cover"
              />
            </div>
          </div>

          {/* Right Content - Author Info */}
          <div className="flex-shrink-0 max-w-lg lg:pl-6">
            <p className="text-sm text-gray-500 mb-2">—Author</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Thompson P.</h2>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness.
            </p>
            <p className="text-gray-600 text-base leading-relaxed">
              When I'm not writing, I spend time volunteering at my local animal shelter, helping cats find loving homes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;