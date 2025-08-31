import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export function useResponsive() {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    breakpoints: theme.breakpoints,
  };
}

export function useBreakpoint(breakpoint: any, direction: 'up' | 'down' | 'only' = 'up') {
  const theme = useTheme();
  
  const query = direction === 'up' 
    ? theme.breakpoints.up(breakpoint)
    : direction === 'down'
    ? theme.breakpoints.down(breakpoint)
    : theme.breakpoints.only(breakpoint);
    
  return useMediaQuery(query);
}