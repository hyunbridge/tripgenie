// lib/unsplash.ts
'use client';

import { createApi } from 'unsplash-js';

// Unsplash API 클라이언트 생성
// 브라우저의 기본 fetch API를 사용합니다
export const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'HcmLIsmCk2XbpH3zuRt0_G6MUYcIiC0b-Tg563N3UOc',
});

// 도시 이미지를 검색하는 함수
export async function getCityImage(city: string, country: string) {
  try {
    // 도시 + 국가 이름으로 이미지 검색
    const result = await unsplash.search.getPhotos({
      query: `${city} ${country} landmark`,
      orientation: 'landscape',
      perPage: 1,
    });

    if (result.errors) {
      console.error('Unsplash API 에러:', result.errors[0]);
      return null;
    }

    // 검색 결과가 있으면 첫 번째 이미지 URL 반환
    if (result.response.results.length > 0) {
      const photo = result.response.results[0];
      return {
        url: photo.urls.regular,
        credit: {
          name: photo.user.name,
          link: photo.user.links.html,
          username: photo.user.username
        }
      };
    }

    // 결과가 없으면 null 반환
    return null;
  } catch (error) {
    console.error('도시 이미지 검색 중 오류 발생:', error);
    return null;
  }
}

// 이미지 캐시를 위한 맵 객체
const imageCache = new Map();

// 도시 이미지를 검색하거나 캐시에서 가져오는 함수
export async function getCachedCityImage(city: string, country: string) {
  const cacheKey = `${city}-${country}`;

  // 캐시에 있으면 캐시된 이미지 반환
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  // 캐시에 없으면 새로 검색
  const imageData = await getCityImage(city, country);

  // 검색 결과가 있으면 캐시에 저장
  if (imageData) {
    imageCache.set(cacheKey, imageData);
    return imageData;
  }

  // 결과가 없으면 기본 이미지 URL 반환
  return {
    url: '/placeholder.jpg',
    credit: null
  };
}
