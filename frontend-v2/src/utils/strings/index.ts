export const abbreviateWords = (str: string, maxLength = 18) => {
  if (str.length > maxLength) {
    const words = str.split(" ")
    let result = ""

    for (let i=0; i<words.length-1; i++) {
      if (words[i].length < 5) {
        result = result.concat(words[i], " ")
      } else {
        result = result.concat(words[i].charAt(0), ". ")
      }
    }

    // append last word (no abbreviation)
    return result.concat(words[words.length-1])
  }

  return str
}

export const shortcutName = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + "..."
  }

  return str
}
