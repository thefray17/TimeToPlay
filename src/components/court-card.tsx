'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Star } from 'lucide-react';
import type { Court } from '@/lib/types';

type CourtCardProps = {
  court: Court;
};

export default function CourtCard({ court }: CourtCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    // For now, let's just log this. In a real app, this would navigate to a details page.
    console.log(`Card for ${court.name} clicked.`);
  }

  return (
    <Card 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl cursor-pointer border-gray-200" 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <div className="relative h-56 w-full">
          <Image
            src={court.imageUrl}
            alt={court.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className={`transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
            data-ai-hint={court.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
              {court.type}
            </Badge>
            {court.tags?.includes('lights') && (
              <Badge className="bg-orange-400/90 text-white backdrop-blur-sm border-orange-400/90 shadow-sm">
                <Zap className="h-3 w-3 mr-1" />
                LIGHTS
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
             <Badge variant="secondary" className="bg-gray-900/60 text-white backdrop-blur-sm flex items-center gap-1 shadow-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{court.rating}</span>
              </Badge>
          </div>

           {court.pricePerHour != null && (
            <div className="absolute bottom-3 right-3">
               <Badge variant="secondary" className="bg-white/95 text-gray-900 text-sm shadow-sm">
                FROM <span className="font-bold ml-1">₱{court.pricePerHour}</span> /hr
              </Badge>
            </div>
           )}
        </div>
        <div className="p-4 bg-card">
          <CardTitle className="font-bold text-xl tracking-tight">{court.name}</CardTitle>
        </div>
      </CardContent>
    </Card>
  );
}
