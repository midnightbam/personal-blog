import React from 'react';
import heroImage from '../assets/Panda-Bamboo_Panda-Quiz_KIDS_1021.avif';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-4 sm:py-6 md:py-8 lg:py-6 xl:py-8 flex items-center">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-6 xl:gap-10 items-center justify-center">
          {/* Left Content */}
          <div className="flex-shrink-0 text-center lg:text-right lg:pr-4 xl:pr-6 w-full lg:w-auto lg:max-w-[280px] xl:max-w-[350px]">
            <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold text-gray-800 text-center leading-tight">
              <span className="lg:inline">
                Feed Your Mind. <br className="lg:inline hidden" />Inspire Your Heart.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-sm xl:text-base text-gray-600 leading-relaxed px-4 sm:px-0 text-center mt-4">
              Every moment you stay curious, you grow stronger, wiser, and closer to your dreams.
            </p>
          </div>
          
          {/* Center Image */}
          <div className="flex-shrink-0 w-full sm:w-auto">
            <div className="relative mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none">
              <img
                src={heroImage}
                alt="Hero image"
                className="rounded-3xl shadow-2xl w-full sm:w-[320px] md:w-[360px] lg:w-[320px] xl:w-[380px] h-[400px] sm:h-[450px] md:h-[500px] lg:h-[450px] xl:h-[500px] object-cover mx-auto"
              />
            </div>
          </div>
          
          {/* Right Content - Author Info */}
          <div className="flex-shrink-0 w-full lg:w-auto lg:max-w-[280px] xl:max-w-[350px] lg:pl-4 xl:pl-6 px-4 sm:px-6 lg:px-0">
            <p className="text-sm sm:text-base lg:text-xs xl:text-sm text-gray-500 mb-1.5 lg:mb-2">—Author</p>
            <h2 className="text-2xl sm:text-3xl lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-3 lg:mb-3">Punyanuch K.</h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-sm xl:text-base text-gray-600 leading-relaxed mb-2.5 sm:mb-3 lg:mb-3">
I am a curious and dedicated learner with a love for exploring new ideas and skills. Always eager to understand the world around me, I enjoy diving into topics that spark my creativity and curiosity.            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-sm xl:text-base text-gray-600 leading-relaxed">
When I’m not learning or experimenting, I enjoy spending time on personal projects, exploring ways to grow, and connecting with others who share my interests.            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;