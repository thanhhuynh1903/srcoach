"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { StyleSheet, Animated, type ViewStyle } from "react-native"

interface SkeletonProps {
  width: number | string
  height: number | string
  style?: ViewStyle
  borderRadius?: number
}

const SkeletonPost: React.FC<SkeletonProps> = ({ width, height, style, borderRadius = 4 }) => {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
            width: typeof width === 'string' ? parseInt(width) : width,
            height: typeof height === 'string' ? parseInt(height) : height,
            borderRadius,
            opacity,
          },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E1E9EE",
  },
})

export default SkeletonPost
