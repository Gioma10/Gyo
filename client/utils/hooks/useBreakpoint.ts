import { useEffect, useState } from "react"

type Breakpoint = "mobile" | "desktop"

export function useBreakpoint(breakpoint = 768): Breakpoint {
  const [current, setCurrent] = useState<Breakpoint>(
    typeof window !== "undefined" && window.innerWidth < breakpoint ? "mobile" : "desktop"
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)

    const handler = (e: MediaQueryListEvent) => {
      setCurrent(e.matches ? "mobile" : "desktop")
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [breakpoint])

  return current
}