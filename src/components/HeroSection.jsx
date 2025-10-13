import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-4 sm:py-6 md:py-8 lg:py-6 xl:py-8 flex items-center">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-6 xl:gap-10 items-center justify-center">
          {/* Left Content */}
          <div className="flex-shrink-0 text-center lg:text-right lg:pr-4 xl:pr-6 w-full lg:w-auto lg:max-w-[280px] xl:max-w-[350px]">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4 lg:mb-4 xl:mb-5">
              <span className="lg:inline">Stay<br className="lg:inline hidden" /> Informed,</span><br />
              <span className="lg:inline">Stay Inspired</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-sm xl:text-base text-gray-600 leading-relaxed px-4 sm:px-0">
              Discover a World of Knowledge at Your Fingertips. Your Daily Dose of Inspiration and Information.
            </p>
          </div>
          
          {/* Center Image */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <div className="relative mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none">
              <img
                src="https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg"
                alt="Thompson P. with cat"
                className="rounded-3xl shadow-2xl w-full sm:w-[320px] md:w-[360px] lg:w-[320px] xl:w-[380px] h-[400px] sm:h-[450px] md:h-[500px] lg:h-[450px] xl:h-[500px] object-cover mx-auto"
              />
            </div>
          </div>
          
          {/* Right Content - Author Info */}
          <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-[280px] xl:max-w-[350px] lg:pl-4 xl:pl-6 px-4 sm:px-6 lg:px-0">
            <p className="text-sm sm:text-base lg:text-xs xl:text-sm text-gray-500 mb-1.5 lg:mb-2">—Author</p>
            <h2 className="text-2xl sm:text-3xl lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-3 lg:mb-3">Thompson P.</h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-sm xl:text-base text-gray-600 leading-relaxed mb-2.5 sm:mb-3 lg:mb-3">
              I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness.
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-sm xl:text-base text-gray-600 leading-relaxed">
              When I'm not writing, I spend time volunteering at my local animal shelter, helping cats find loving homes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;