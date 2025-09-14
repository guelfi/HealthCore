import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, List, ListItem, CircularProgress } from '@mui/material';
import { usePerformanceOptimization } from '../../../hooks/usePerformanceOptimization';
import { useResponsive } from '../../../hooks/useResponsive';
import { BaseSkeleton } from '../Skeleton';

export interface VirtualizedListProps<T = any> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight?: number;
  overscan?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  loading?: boolean;
  hasNextPage?: boolean;
  className?: string;
  gap?: number;
  padding?: number;
}

export const VirtualizedList = <T,>({
  items,
  itemHeight,
  renderItem,
  containerHeight = 400,
  overscan = 5,
  onEndReached,
  onEndReachedThreshold = 0.8,
  loading = false,
  hasNextPage = false,
  className,
  gap = 0,
  padding = 0
}: VirtualizedListProps<T>) => {
  const { isMobile } = useResponsive();
  const { optimizations } = usePerformanceOptimization();
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Ajusta overscan baseado na performance
  const adjustedOverscan = optimizations.shouldUseVirtualization 
    ? Math.max(overscan, isMobile ? 3 : 5)
    : overscan;

  // Calcula altura do item
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index, items[index]);
    }
    return itemHeight;
  }, [itemHeight, items]);

  // Calcula posições dos itens
  const itemPositions = useMemo(() => {
    const positions: number[] = [];
    let totalHeight = padding;
    
    for (let i = 0; i < items.length; i++) {
      positions[i] = totalHeight;
      totalHeight += getItemHeight(i) + gap;
    }
    
    return { positions, totalHeight: totalHeight + padding };
  }, [items.length, getItemHeight, gap, padding]);

  // Calcula itens visíveis
  const visibleRange = useMemo(() => {
    if (!optimizations.shouldUseVirtualization) {
      return { start: 0, end: items.length - 1 };
    }

    const { positions } = itemPositions;
    const containerTop = scrollTop;
    const containerBottom = scrollTop + containerHeight;

    let start = 0;
    let end = items.length - 1;

    // Encontra primeiro item visível
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] + getItemHeight(i) >= containerTop) {
        start = Math.max(0, i - adjustedOverscan);
        break;
      }
    }

    // Encontra último item visível
    for (let i = start; i < positions.length; i++) {
      if (positions[i] > containerBottom) {
        end = Math.min(items.length - 1, i + adjustedOverscan);
        break;
      }
    }

    return { start, end };
  }, [scrollTop, containerHeight, itemPositions, items.length, getItemHeight, adjustedOverscan, optimizations.shouldUseVirtualization]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Check if we need to load more items
    if (onEndReached && hasNextPage && !loading) {
      const { totalHeight } = itemPositions;
      const scrollPercentage = (newScrollTop + containerHeight) / totalHeight;
      
      if (scrollPercentage >= onEndReachedThreshold) {
        onEndReached();
      }
    }
  }, [onEndReached, hasNextPage, loading, itemPositions, containerHeight, onEndReachedThreshold]);

  // Renderiza item com skeleton durante scroll rápido
  const renderVirtualItem = useCallback((item: T, index: number) => {
    const shouldShowSkeleton = isScrolling && optimizations.shouldReduceAnimations;
    
    if (shouldShowSkeleton) {
      return (
        <BaseSkeleton
          variant="rectangular"
          width="100%"
          height={getItemHeight(index)}
          animation={false}
        />
      );
    }

    return renderItem(item, index);
  }, [isScrolling, optimizations.shouldReduceAnimations, renderItem, getItemHeight]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const { positions, totalHeight } = itemPositions;

  return (
    <Box
      ref={containerRef}
      className={`virtualized-list ${className || ''}`}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        // Otimizações de scroll para mobile
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: optimizations.shouldReduceAnimations ? 'auto' : 'smooth',
      }}
      onScroll={handleScroll}
    >
      {/* Container virtual com altura total */}
      <Box sx={{ height: totalHeight, position: 'relative' }}>
        {/* Renderiza apenas itens visíveis */}
        {items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => {
          const actualIndex = visibleRange.start + index;
          const top = positions[actualIndex];
          
          return (
            <Box
              key={actualIndex}
              sx={{
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                height: getItemHeight(actualIndex),
              }}
            >
              {renderVirtualItem(item, actualIndex)}
            </Box>
          );
        })}
        
        {/* Loading indicator */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: positions[items.length - 1] + getItemHeight(items.length - 1) + gap,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 60,
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Lista virtualizada específica para MUI List
export interface VirtualizedMuiListProps<T = any> extends Omit<VirtualizedListProps<T>, 'renderItem'> {
  renderListItem: (item: T, index: number) => React.ReactNode;
  dense?: boolean;
  disablePadding?: boolean;
}

export const VirtualizedMuiList = <T,>({
  renderListItem,
  dense = false,
  disablePadding = false,
  ...props
}: VirtualizedMuiListProps<T>) => {
  const renderItem = useCallback((item: T, index: number) => (
    <ListItem
      dense={dense}
      disablePadding={disablePadding}
      sx={{
        px: disablePadding ? 0 : 2,
        py: dense ? 0.5 : 1,
      }}
    >
      {renderListItem(item, index)}
    </ListItem>
  ), [renderListItem, dense, disablePadding]);

  return (
    <List component="div" disablePadding>
      <VirtualizedList
        {...props}
        renderItem={renderItem}
      />
    </List>
  );
};

export default VirtualizedList;