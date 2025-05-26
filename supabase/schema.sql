-- 1. 여행 계획 저장을 위한 테이블
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  preferences TEXT[] DEFAULT '{}',
  itinerary JSONB NOT NULL,
  image_url TEXT,
  search_id UUID, -- 검색 ID 저장 (search_results 테이블의 ID 참조는 선택적)
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. 검색 결과 저장을 위한 별도 테이블
CREATE TABLE IF NOT EXISTS search_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travel_type TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  results JSONB NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책 완전히 비활성화 (회원 기능이 없는 애플리케이션)
ALTER TABLE travel_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_results DISABLE ROW LEVEL SECURITY;
