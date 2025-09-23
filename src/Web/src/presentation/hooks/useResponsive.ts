import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  // Novas propriedades para melhor detecção mobile
  isTouchDevice: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  deviceType: 'mobile' | 'tablet' | 'desktop';
  breakpoints: any;
}

export function useResponsive(): DeviceInfo {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  // Detecção avançada de dispositivos
  const [deviceInfo, setDeviceInfo] = useState({
    isTouchDevice: false,
    isPortrait: true,
    isLandscape: false,
    screenSize: { width: 0, height: 0 },
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const isTouchDevice = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        (navigator as any).msMaxTouchPoints > 0;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        isTouchDevice,
        isPortrait: height > width,
        isLandscape: width > height,
        screenSize: { width, height },
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  // Determinar tipo de dispositivo com maior precisão
  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (isMobile && deviceInfo.isTouchDevice) return 'mobile';
    if (isTablet && deviceInfo.isTouchDevice) return 'tablet';
    if (isSmallScreen && deviceInfo.isTouchDevice) return 'tablet';
    return 'desktop';
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isTouchDevice: deviceInfo.isTouchDevice,
    isPortrait: deviceInfo.isPortrait,
    isLandscape: deviceInfo.isLandscape,
    screenSize: deviceInfo.screenSize,
    deviceType: getDeviceType(),
    breakpoints: theme.breakpoints,
  };
}

export function useBreakpoint(
  breakpoint: any,
  direction: 'up' | 'down' | 'only' = 'up'
) {
  const theme = useTheme();

  const query =
    direction === 'up'
      ? theme.breakpoints.up(breakpoint)
      : direction === 'down'
        ? theme.breakpoints.down(breakpoint)
        : theme.breakpoints.only(breakpoint);

  return useMediaQuery(query);
}
