import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Function to parse and render formatted text
const renderFormattedText = (text) => {
  if (!text) return '';

  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, lineIndex) => {
    if (!line) {
      elements.push(<br key={`br-${lineIndex}`} />);
      return;
    }

    // Handle bullet points (• text or - text)
    if (line.match(/^[•\-]\s/)) {
      const content = line.replace(/^[•\-]\s/, '');
      elements.push(
        <div key={`bullet-${lineIndex}`} className="flex gap-2">
          <span>•</span>
          <span>{parseInlineFormatting(content)}</span>
        </div>
      );
      return;
    }

    // Handle numbered lists (1. text, 2. text, etc)
    const numberMatch = line.match(/^(\d+)\.\s/);
    if (numberMatch) {
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={`number-${lineIndex}`} className="flex gap-2">
          <span>{numberMatch[1]}.</span>
          <span>{parseInlineFormatting(content)}</span>
        </div>
      );
      return;
    }

    // Regular text with inline formatting
    elements.push(
      <div key={`line-${lineIndex}`}>{parseInlineFormatting(line)}</div>
    );
  });

  return elements;
};

// Parse inline formatting: **bold**, *italic*, __underline__
const parseInlineFormatting = (text) => {
  const parts = [];
  let lastIndex = 0;

  // Match **bold**, *italic*, __underline__
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add formatted text
    if (match[1]) {
      // Bold
      parts.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);
    } else if (match[2]) {
      // Italic
      parts.push(<em key={`italic-${match.index}`}>{match[2]}</em>);
    } else if (match[3]) {
      // Underline
      parts.push(<u key={`underline-${match.index}`}>{match[3]}</u>);
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const HeroSection = () => {
  // Panda image from public folder
  const heroImage = '/Panda-Bamboo_Panda-Quiz_KIDS_1021.avif';
  const defaultHeroBio = 'I am a curious and dedicated learner with a love for exploring new ideas and skills. Always eager to understand the world around me, I enjoy diving into topics that spark my creativity and curiosity. When I\'m not learning or experimenting, I enjoy spending time on personal projects, exploring ways to grow, and connecting with others who share my interests.';

  const [authorData, setAuthorData] = useState({
    name: 'Punyanuch K.',
    heroBio: defaultHeroBio
  });

  // Fetch author data from admin profile
  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        console.log('🔍 Fetching admin author data...');
        
        // Fetch data from the specific admin email
        const { data, error } = await supabase
          .from('users')
          .select('id, name, hero_bio, email, created_at')
          .eq('email', 'bam.ksnru@gmail.com');

        if (error) {
          console.error('❌ Error fetching author data:', error);
          return;
        }

        console.log('✅ Fetched user data:', data);

        if (data && data.length > 0) {
          const user = data[0];
          console.log('📝 Admin email:', user.email);
          console.log('📝 User name:', user.name);
          console.log('📝 Hero bio:', user.hero_bio);
          
          setAuthorData({
            name: user.name || 'Punyanuch K.',
            heroBio: user.hero_bio || defaultHeroBio
          });
        } else {
          console.log('⚠️ No admin user found');
        }
      } catch (err) {
        console.error('Exception fetching author:', err);
      }
    };

    fetchAuthorData();

    // Subscribe to real-time changes to author profile
    const channel = supabase
      .channel('hero-author-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        async (payload) => {
          console.log('Author profile updated:', payload);
          // Refetch data when author profile is updated
          await fetchAuthorData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [defaultHeroBio]);
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
            <h2 className="text-2xl sm:text-3xl lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2.5 sm:mb-3 lg:mb-3">{authorData.name}</h2>
            <div className="text-base sm:text-lg md:text-xl lg:text-sm xl:text-base text-gray-600 leading-relaxed space-y-2">
              {renderFormattedText(authorData.heroBio)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;