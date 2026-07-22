import { useState, useEffect } from "react"
import { storage } from "../utils"

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => storage(key).get(initialValue))

  useEffect(() => {
    storage(key).set(value)
  }, [key, value])

  return [value, setValue]
}
