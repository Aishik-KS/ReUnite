function compareImageDescriptions(desc1, desc2) {
  const tokenize = (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);
  };

  const tokens1 = tokenize(desc1);
  const tokens2 = tokenize(desc2);

  const allWords = [...new Set([...tokens1, ...tokens2])];

  const vector1 = allWords.map(
    (word) => tokens1.filter((t) => t === word).length / tokens1.length
  );
  const vector2 = allWords.map(
    (word) => tokens2.filter((t) => t === word).length / tokens2.length
  );

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < allWords.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    magnitude1 += vector1[i] * vector1[i];
    magnitude2 += vector2[i] * vector2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  const similarity = dotProduct / (magnitude1 * magnitude2);
  if (isNaN(similarity)) return 0;

  return Math.round(similarity * 100);
}

module.exports = { compareImageDescriptions };
