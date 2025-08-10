import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  RadialGradient, 
  Stop,
  Line,
  Polygon,
} from 'react-native-svg';

import { futuristicTheme, gradients, particleConfig } from '@/theme/futuristicTheme';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  speed: number;
  color: string;
  size: number;
}

const FuturisticBackground: React.FC = () => {
  const particles = useRef<Particle[]>([]);
  const gridAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeParticles();
    startAnimations();
    
    return () => {
      // Cleanup animations
      particles.current.forEach(particle => {
        particle.x.stopAnimation();
        particle.y.stopAnimation();
        particle.scale.stopAnimation();
        particle.opacity.stopAnimation();
      });
    };
  }, []);

  const initializeParticles = () => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleConfig.count; i++) {
      const particle: Particle = {
        id: i,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        scale: new Animated.Value(Math.random() * 0.5 + 0.5),
        opacity: new Animated.Value(
          Math.random() * (particleConfig.opacity.max - particleConfig.opacity.min) + 
          particleConfig.opacity.min
        ),
        speed: Math.random() * particleConfig.speed + 0.5,
        color: particleConfig.colors[Math.floor(Math.random() * particleConfig.colors.length)],
        size: Math.random() * (particleConfig.size.max - particleConfig.size.min) + 
               particleConfig.size.min,
      };
      
      newParticles.push(particle);
      animateParticle(particle);
    }
    
    particles.current = newParticles;
  };

  const animateParticle = (particle: Particle) => {
    const animateMovement = () => {
      const newX = Math.random() * width;
      const newY = Math.random() * height;
      const duration = (Math.random() * 10000 + 5000) / particle.speed;

      Animated.parallel([
        Animated.timing(particle.x, {
          toValue: newX,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(particle.y, {
          toValue: newY,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]).start(animateMovement);
    };

    const animateScale = () => {
      Animated.sequence([
        Animated.timing(particle.scale, {
          toValue: Math.random() * 0.8 + 0.2,
          duration: Math.random() * 3000 + 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
        Animated.timing(particle.scale, {
          toValue: Math.random() * 0.8 + 0.2,
          duration: Math.random() * 3000 + 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
      ]).start(animateScale);
    };

    const animateOpacity = () => {
      Animated.sequence([
        Animated.timing(particle.opacity, {
          toValue: Math.random() * 0.5 + 0.3,
          duration: Math.random() * 4000 + 3000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
        Animated.timing(particle.opacity, {
          toValue: Math.random() * 0.5 + 0.3,
          duration: Math.random() * 4000 + 3000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
      ]).start(animateOpacity);
    };

    animateMovement();
    animateScale();
    animateOpacity();
  };

  const startAnimations = () => {
    // Grid animation
    Animated.loop(
      Animated.timing(gridAnimation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Wave animation
    Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  };

  const renderParticles = () => {
    return particles.current.map((particle) => (
      <Animated.View
        key={particle.id}
        style={[
          styles.particle,
          {
            left: particle.x,
            top: particle.y,
            transform: [{ scale: particle.scale }],
            opacity: particle.opacity,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
          },
        ]}
      />
    ));
  };

  const renderGrid = () => {
    const gridSize = 50;
    const lines = [];
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={futuristicTheme.colors.primary}
          strokeWidth={0.5}
          opacity={0.1}
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={futuristicTheme.colors.primary}
          strokeWidth={0.5}
          opacity={0.1}
        />
      );
    }
    
    return lines;
  };

  const renderGeometricShapes = () => {
    return (
      <>
        {/* Central hexagon */}
        <Polygon
          points={`${width/2},${height/2-40} ${width/2+35},${height/2-20} ${width/2+35},${height/2+20} ${width/2},${height/2+40} ${width/2-35},${height/2+20} ${width/2-35},${height/2-20}`}
          fill="none"
          stroke={futuristicTheme.colors.secondary}
          strokeWidth={1}
          opacity={0.3}
        />
        
        {/* Corner triangles */}
        <Polygon
          points="50,50 100,50 75,25"
          fill="none"
          stroke={futuristicTheme.colors.accent}
          strokeWidth={1}
          opacity={0.2}
        />
        
        <Polygon
          points={`${width-100},50 ${width-50},50 ${width-75},25`}
          fill="none"
          stroke={futuristicTheme.colors.accent}
          strokeWidth={1}
          opacity={0.2}
        />
        
        <Polygon
          points={`50,${height-50} 100,${height-50} 75,${height-25}`}
          fill="none"
          stroke={futuristicTheme.colors.accent}
          strokeWidth={1}
          opacity={0.2}
        />
        
        <Polygon
          points={`${width-100},${height-50} ${width-50},${height-50} ${width-75},${height-25}`}
          fill="none"
          stroke={futuristicTheme.colors.accent}
          strokeWidth={1}
          opacity={0.2}
        />
      </>
    );
  };

  const renderCircuits = () => {
    return (
      <>
        {/* Circuit patterns */}
        <Path
          d={`M 20 ${height/4} L 80 ${height/4} L 80 ${height/4 + 60} L 140 ${height/4 + 60}`}
          fill="none"
          stroke={futuristicTheme.colors.primary}
          strokeWidth={1}
          opacity={0.15}
        />
        
        <Path
          d={`M ${width-20} ${height*3/4} L ${width-80} ${height*3/4} L ${width-80} ${height*3/4 - 60} L ${width-140} ${height*3/4 - 60}`}
          fill="none"
          stroke={futuristicTheme.colors.secondary}
          strokeWidth={1}
          opacity={0.15}
        />
        
        {/* Circuit nodes */}
        <Circle
          cx={80}
          cy={height/4}
          r={3}
          fill={futuristicTheme.colors.primary}
          opacity={0.4}
        />
        
        <Circle
          cx={width-80}
          cy={height*3/4}
          r={3}
          fill={futuristicTheme.colors.secondary}
          opacity={0.4}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={gradients.backgroundGradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Animated grid overlay */}
      <Animated.View
        style={[
          styles.gridContainer,
          {
            opacity: gridAnimation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.1, 0.3, 0.1],
            }),
          },
        ]}
      >
        <Svg width={width} height={height} style={styles.svg}>
          <Defs>
            <RadialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={futuristicTheme.colors.primary} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={futuristicTheme.colors.primary} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          
          {renderGrid()}
          {renderGeometricShapes()}
          {renderCircuits()}
          
          {/* Pulse effect */}
          <Circle
            cx={width/2}
            cy={height/2}
            r={pulseAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, width/2],
            })}
            fill="url(#pulseGradient)"
            opacity={pulseAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0],
            })}
          />
        </Svg>
      </Animated.View>
      
      {/* Floating particles */}
      <View style={styles.particleContainer}>
        {renderParticles()}
      </View>
      
      {/* Overlay gradient for depth */}
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 15, 0.3)', 'transparent']}
        style={styles.overlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradient: {
    flex: 1,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  svg: {
    position: 'absolute',
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: futuristicTheme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default FuturisticBackground;