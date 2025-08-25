'use client';

import { useRef, useCallback } from 'react';

interface GestureHandlers {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinchOut?: () => void;
  onPinchIn?: () => void;
  onDragStart?: (x: number, y: number) => void;
  onDragMove?: (deltaX: number, deltaY: number) => void;
  onDragEnd?: () => void;
}

interface TouchData {
  startX: number;
  startY: number;
  startTime: number;
  startDistance?: number;
  isPinching?: boolean;
  isDragging?: boolean;
  dragThreshold?: number;
}

export function useGestures(handlers: GestureHandlers) {
  const touchData = useRef<TouchData>({ startX: 0, startY: 0, startTime: 0 });
  
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchData.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isPinching: false,
      isDragging: false,
      dragThreshold: 10 // 드래그 시작 임계값
    };

    // 멀티터치 (pinch) 감지
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      touchData.current.startDistance = distance;
      touchData.current.isPinching = true;
      console.log('Pinch start detected'); // 디버깅용
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    // pinch 감지 (터치 이동 중)
    if (e.touches.length === 2 && touchData.current.startDistance && touchData.current.isPinching) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const scale = currentDistance / touchData.current.startDistance;
      
      console.log('Pinch scale:', scale); // 디버깅용
      
      if (scale < 0.7) {
        console.log('Pinch in detected'); // 디버깅용
        handlers.onPinchIn?.();
        touchData.current.isPinching = false; // 한 번만 실행되도록
      } else if (scale > 1.3) {
        console.log('Pinch out detected'); // 디버깅용
        handlers.onPinchOut?.();
        touchData.current.isPinching = false; // 한 번만 실행되도록
      }
      
      // pinch 중에는 스크롤 방지
      e.preventDefault();
      return;
    }
    
    // 단일 터치에서 실시간 드래그 및 스와이프 감지
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchData.current.startX;
      const deltaY = touch.clientY - touchData.current.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // 드래그 시작 감지 (임계값 초과 시)
      if (!touchData.current.isDragging && distance > (touchData.current.dragThreshold || 10)) {
        touchData.current.isDragging = true;
        handlers.onDragStart?.(touch.clientX, touch.clientY);
        console.log('Drag started'); // 디버깅용
      }
      
      // 드래그 중이면 실시간으로 위치 업데이트
      if (touchData.current.isDragging) {
        handlers.onDragMove?.(deltaX, deltaY);
        e.preventDefault(); // 드래그 중에는 스크롤 방지
        return;
      }
      
      // Pull-to-refresh 방지: 아래쪽으로 스와이프하는 경우 항상 방지
      if (deltaY > 0) {
        e.preventDefault();
      }
      
      // 스와이프로 판단될 만한 움직임이 있을 때 방지
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        e.preventDefault();
      }
    }
  }, [handlers]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    // pinch 제스처 중이었다면 리셋
    if (touchData.current.isPinching) {
      touchData.current.isPinching = false;
      return;
    }

    // 드래그 중이었다면 드래그 종료
    if (touchData.current.isDragging) {
      console.log('Drag ended'); // 디버깅용
      handlers.onDragEnd?.();
      touchData.current.isDragging = false;
      return;
    }


    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchData.current.startX;
    const deltaY = touch.clientY - touchData.current.startY;
    const deltaTime = Date.now() - touchData.current.startTime;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // 스와이프 임계값 (더 감도 높게 조정)
    const MIN_DISTANCE = 30;
    const MIN_VELOCITY = 0.2;

    console.log('Swipe detected:', { distance, velocity, deltaX, deltaY }); // 디버깅용

    if (distance > MIN_DISTANCE && velocity > MIN_VELOCITY) {
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      console.log('Swipe angle:', angle); // 디버깅용
      
      if (angle >= -45 && angle <= 45) {
        // 오른쪽 스와이프
        console.log('Right swipe'); // 디버깅용
        handlers.onSwipeRight?.();
      } else if (angle >= 135 || angle <= -135) {
        // 왼쪽 스와이프
        console.log('Left swipe'); // 디버깅용
        handlers.onSwipeLeft?.();
      } else if (angle >= 45 && angle <= 135) {
        // 아래쪽 스와이프 (Pull-to-refresh 대신 Affinity Diagram 진입)
        console.log('Down swipe - switching to affinity'); // 디버깅용
        handlers.onSwipeDown?.();
      } else if (angle >= -135 && angle <= -45) {
        // 위쪽 스와이프
        console.log('Up swipe'); // 디버깅용
        handlers.onSwipeUp?.();
      }
    }

    // 터치 데이터 리셋
    touchData.current.isPinching = false;
    touchData.current.isDragging = false;
  }, [handlers]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}