'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GalleryCarousel({ photos }: { photos: { id: string; imageUrl: string; caption?: string }[] }) {
  const [shuffled] = useState(() => shuffle(photos ?? []));
  const [api, setApi] = useState<CarouselApi>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!api) return;
    intervalRef.current = setInterval(() => {
      if (api.canScrollNext()) api.scrollNext(); else api.scrollTo(0);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, [api]);

  if (!shuffled || shuffled.length === 0) return null;

  return (
    <Carousel setApi={setApi} opts={{ loop: true, align: 'start' }} className="w-full">
      <CarouselContent>
        {shuffled.map((photo) => (
          <CarouselItem key={photo.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F8F4EF]">
              <Image src={photo.imageUrl} alt={photo.caption ?? 'Holisya'} fill className="object-cover" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
