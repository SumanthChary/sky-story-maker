export interface Star {
  x: number;
  y: number;
  timestamp: number;
}

export interface ConstellationLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PatternAnalysis {
  numStars: number;
  shapeType: string;
  distributionType: string;
  avgDistance: number;
  distanceVariance: number;
  centroid: { x: number; y: number };
  starPositions: Array<{ id: number; x: number; y: number }>;
}

export function analyzeStarPattern(stars: Star[]): PatternAnalysis {
  const centroid = {
    x: stars.reduce((sum, star) => sum + star.x, 0) / stars.length,
    y: stars.reduce((sum, star) => sum + star.y, 0) / stars.length,
  };

  // Calculate distances and statistics
  const distances = stars.map((star) =>
    Math.sqrt(Math.pow(star.x - centroid.x, 2) + Math.pow(star.y - centroid.y, 2))
  );

  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const distanceVariance =
    distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
  const distanceStdDev = Math.sqrt(distanceVariance);

  // Analyze distribution
  const distributionType =
    distanceStdDev / avgDistance > 0.5
      ? "scattered"
      : distanceStdDev / avgDistance < 0.2
      ? "clustered"
      : "balanced";

  const shapeType = detectShape(stars, centroid, distanceStdDev, avgDistance);

  const starPositions = stars.map((star, i) => ({
    id: i + 1,
    x: Math.round(star.x),
    y: Math.round(star.y),
  }));

  return {
    numStars: stars.length,
    shapeType,
    distributionType,
    avgDistance: Math.round(avgDistance),
    distanceVariance: Math.round(distanceVariance),
    centroid: {
      x: Math.round(centroid.x),
      y: Math.round(centroid.y),
    },
    starPositions,
  };
}

function detectShape(
  stars: Star[],
  centroid: { x: number; y: number },
  distanceStdDev: number,
  avgDistance: number
): string {
  // Linear detection using PCA-like approach
  if (stars.length >= 3) {
    let covXX = 0,
      covYY = 0,
      covXY = 0;
    stars.forEach((star) => {
      const dx = star.x - centroid.x;
      const dy = star.y - centroid.y;
      covXX += dx * dx;
      covYY += dy * dy;
      covXY += dx * dy;
    });

    const trace = covXX + covYY;
    const det = covXX * covYY - covXY * covXY;
    const eigenvalues = [
      trace / 2 + Math.sqrt(trace * trace / 4 - det),
      trace / 2 - Math.sqrt(trace * trace / 4 - det),
    ];

    const linearityRatio = Math.min(...eigenvalues) / Math.max(...eigenvalues);
    if (linearityRatio < 0.15) return "linear";
  }

  // Circular/Elliptical detection
  const angleVariances = stars.map((star) => {
    return Math.atan2(star.y - centroid.y, star.x - centroid.x);
  });

  angleVariances.sort((a, b) => a - b);
  let maxGap = 0;
  for (let i = 0; i < angleVariances.length; i++) {
    const gap =
      i === angleVariances.length - 1
        ? 2 * Math.PI + angleVariances[0] - angleVariances[i]
        : angleVariances[i + 1] - angleVariances[i];
    maxGap = Math.max(maxGap, gap);
  }

  if (maxGap < Math.PI / 2 && distanceStdDev / avgDistance < 0.3) {
    return "circular";
  } else if (maxGap < Math.PI / 2) {
    return "elliptical";
  }

  // Triangular detection
  if (stars.length === 3) {
    return "triangular";
  }

  // Rectangular detection
  if (stars.length === 4) {
    const angles = [];
    for (let i = 0; i < 4; i++) {
      const p1 = stars[i];
      const p2 = stars[(i + 1) % 4];
      const p3 = stars[(i + 2) % 4];

      const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
      const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

      const dot = v1.x * v2.x + v1.y * v2.y;
      const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

      angles.push(Math.acos(dot / (mag1 * mag2)));
    }

    const rightAngles = angles.filter((a) => Math.abs(a - Math.PI / 2) < 0.3).length;
    if (rightAngles >= 3) return "rectangular";
  }

  // Grid detection
  if (stars.length >= 6) {
    const xPositions = stars.map((s) => s.x).sort((a, b) => a - b);
    const yPositions = stars.map((s) => s.y).sort((a, b) => a - b);

    const xGaps = [],
      yGaps = [];
    for (let i = 1; i < xPositions.length; i++) {
      xGaps.push(xPositions[i] - xPositions[i - 1]);
    }
    for (let i = 1; i < yPositions.length; i++) {
      yGaps.push(yPositions[i] - yPositions[i - 1]);
    }

    const avgXGap = xGaps.reduce((a, b) => a + b, 0) / xGaps.length;
    const avgYGap = yGaps.reduce((a, b) => a + b, 0) / yGaps.length;

    const xRegularity =
      xGaps.filter((g) => Math.abs(g - avgXGap) < avgXGap * 0.3).length / xGaps.length;
    const yRegularity =
      yGaps.filter((g) => Math.abs(g - avgYGap) < avgYGap * 0.3).length / yGaps.length;

    if (xRegularity > 0.6 && yRegularity > 0.6) return "grid";
  }

  // Radial pattern detection
  if (stars.length >= 5) {
    let centerStar = null;
    let minTotalDistance = Infinity;

    stars.forEach((star, i) => {
      const totalDist = stars.reduce(
        (sum, other, j) =>
          i === j
            ? sum
            : sum +
              Math.sqrt(Math.pow(star.x - other.x, 2) + Math.pow(star.y - other.y, 2)),
        0
      );

      if (totalDist < minTotalDistance) {
        minTotalDistance = totalDist;
        centerStar = star;
      }
    });

    if (centerStar) {
      const angles = stars
        .filter((s) => s !== centerStar)
        .map((s) => Math.atan2(s.y - centerStar.y, s.x - centerStar.x))
        .sort((a, b) => a - b);

      let isRegular = true;
      const expectedAngle = (2 * Math.PI) / (stars.length - 1);
      for (let i = 0; i < angles.length; i++) {
        const nextAngle = i === angles.length - 1 ? angles[0] + 2 * Math.PI : angles[i + 1];
        const actualGap = nextAngle - angles[i];
        if (Math.abs(actualGap - expectedAngle) > expectedAngle * 0.3) {
          isRegular = false;
          break;
        }
      }

      if (isRegular) return "radial";
    }
  }

  return "abstract";
}

export function calculateConstellationLines(
  stars: Star[],
  shapeType: string
): ConstellationLine[] {
  if (stars.length < 2) return [];

  const connections: ConstellationLine[] = [];

  if (shapeType === "linear") {
    return calculateLinearConnections(stars);
  } else if (shapeType === "circular" || shapeType === "elliptical") {
    return calculateCircularConnections(stars);
  } else if (shapeType === "triangular" && stars.length === 3) {
    return calculateClosedShape(stars);
  } else if (shapeType === "rectangular" && stars.length === 4) {
    return calculateRectangularConnections(stars);
  } else if (shapeType === "grid") {
    return calculateGridConnections(stars);
  } else if (shapeType === "radial") {
    return calculateRadialConnections(stars);
  } else {
    return calculateAbstractConnections(stars);
  }
}

function calculateLinearConnections(stars: Star[]): ConstellationLine[] {
  // Find the two most distant stars
  let maxDist = 0;
  let p1 = null,
    p2 = null;

  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dist = Math.sqrt(
        Math.pow(stars[i].x - stars[j].x, 2) + Math.pow(stars[i].y - stars[j].y, 2)
      );
      if (dist > maxDist) {
        maxDist = dist;
        p1 = stars[i];
        p2 = stars[j];
      }
    }
  }

  if (!p1 || !p2) return [];

  // Project all stars onto the line
  const direction = { x: p2.x - p1.x, y: p2.y - p1.y };
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
  const unitDir = { x: direction.x / length, y: direction.y / length };

  const projectedStars = stars.map((star) => {
    const v = { x: star.x - p1.x, y: star.y - p1.y };
    const projection = v.x * unitDir.x + v.y * unitDir.y;
    return { star, projection };
  });

  projectedStars.sort((a, b) => a.projection - b.projection);

  const connections: ConstellationLine[] = [];
  for (let i = 0; i < projectedStars.length - 1; i++) {
    connections.push({
      x1: projectedStars[i].star.x,
      y1: projectedStars[i].star.y,
      x2: projectedStars[i + 1].star.x,
      y2: projectedStars[i + 1].star.y,
    });
  }

  return connections;
}

function calculateCircularConnections(stars: Star[]): ConstellationLine[] {
  const centroid = {
    x: stars.reduce((sum, star) => sum + star.x, 0) / stars.length,
    y: stars.reduce((sum, star) => sum + star.y, 0) / stars.length,
  };

  const sortedStars = [...stars].sort((a, b) => {
    const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
    const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
    return angleA - angleB;
  });

  return calculateClosedShape(sortedStars);
}

function calculateClosedShape(stars: Star[]): ConstellationLine[] {
  const connections: ConstellationLine[] = [];
  for (let i = 0; i < stars.length; i++) {
    const next = (i + 1) % stars.length;
    connections.push({
      x1: stars[i].x,
      y1: stars[i].y,
      x2: stars[next].x,
      y2: stars[next].y,
    });
  }
  return connections;
}

function calculateRectangularConnections(stars: Star[]): ConstellationLine[] {
  const centroid = {
    x: stars.reduce((sum, star) => sum + star.x, 0) / 4,
    y: stars.reduce((sum, star) => sum + star.y, 0) / 4,
  };

  const sortedStars = [...stars].sort((a, b) => {
    const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
    const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
    return angleA - angleB;
  });

  return calculateClosedShape(sortedStars);
}

function calculateGridConnections(stars: Star[]): ConstellationLine[] {
  const connections: ConstellationLine[] = [];

  // Horizontal connections
  const rows = new Map<number, Star[]>();
  stars.forEach((star) => {
    const roundedY = Math.round(star.y / 10) * 10;
    if (!rows.has(roundedY)) rows.set(roundedY, []);
    rows.get(roundedY)!.push(star);
  });

  rows.forEach((rowStars) => {
    const sorted = rowStars.sort((a, b) => a.x - b.x);
    for (let i = 0; i < sorted.length - 1; i++) {
      connections.push({
        x1: sorted[i].x,
        y1: sorted[i].y,
        x2: sorted[i + 1].x,
        y2: sorted[i + 1].y,
      });
    }
  });

  // Vertical connections
  const cols = new Map<number, Star[]>();
  stars.forEach((star) => {
    const roundedX = Math.round(star.x / 10) * 10;
    if (!cols.has(roundedX)) cols.set(roundedX, []);
    cols.get(roundedX)!.push(star);
  });

  cols.forEach((colStars) => {
    const sorted = colStars.sort((a, b) => a.y - b.y);
    for (let i = 0; i < sorted.length - 1; i++) {
      connections.push({
        x1: sorted[i].x,
        y1: sorted[i].y,
        x2: sorted[i + 1].x,
        y2: sorted[i + 1].y,
      });
    }
  });

  return connections;
}

function calculateRadialConnections(stars: Star[]): ConstellationLine[] {
  const connections: ConstellationLine[] = [];

  // Find center star
  let centerStar = null;
  let minTotalDistance = Infinity;

  stars.forEach((star, i) => {
    const totalDist = stars.reduce(
      (sum, other, j) =>
        i === j
          ? sum
          : sum + Math.sqrt(Math.pow(star.x - other.x, 2) + Math.pow(star.y - other.y, 2)),
      0
    );

    if (totalDist < minTotalDistance) {
      minTotalDistance = totalDist;
      centerStar = star;
    }
  });

  if (!centerStar) return connections;

  stars.forEach((star) => {
    if (star !== centerStar) {
      connections.push({
        x1: centerStar.x,
        y1: centerStar.y,
        x2: star.x,
        y2: star.y,
      });
    }
  });

  return connections;
}

function calculateAbstractConnections(stars: Star[]): ConstellationLine[] {
  if (stars.length === 0) return [];

  // Use Minimum Spanning Tree with potential closing connections
  const visited = new Set<number>();
  const edges: Array<{ from: number; to: number; distance: number }> = [];
  const mst: Array<{ from: number; to: number }> = [];

  // Create all edges
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const distance = Math.sqrt(
        Math.pow(stars[i].x - stars[j].x, 2) + Math.pow(stars[i].y - stars[j].y, 2)
      );
      edges.push({ from: i, to: j, distance });
    }
  }

  edges.sort((a, b) => a.distance - b.distance);

  visited.add(0);

  while (visited.size < stars.length) {
    let minEdge = null;
    let minDistance = Infinity;

    for (const edge of edges) {
      if (
        (visited.has(edge.from) && !visited.has(edge.to)) ||
        (!visited.has(edge.from) && visited.has(edge.to))
      ) {
        if (edge.distance < minDistance) {
          minDistance = edge.distance;
          minEdge = edge;
        }
      }
    }

    if (minEdge) {
      mst.push(minEdge);
      visited.add(minEdge.from);
      visited.add(minEdge.to);
    } else {
      break;
    }
  }

  const connections: ConstellationLine[] = mst.map((edge) => ({
    x1: stars[edge.from].x,
    y1: stars[edge.from].y,
    x2: stars[edge.to].x,
    y2: stars[edge.to].y,
  }));

  // For small constellations, try to close the shape
  if (stars.length <= 6) {
    const centroid = {
      x: stars.reduce((sum, star) => sum + star.x, 0) / stars.length,
      y: stars.reduce((sum, star) => sum + star.y, 0) / stars.length,
    };

    const sortedStars = [...stars].sort((a, b) => {
      const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
      const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
      return angleA - angleB;
    });

    for (let i = 0; i < sortedStars.length; i++) {
      const next = (i + 1) % sortedStars.length;
      const distance = Math.sqrt(
        Math.pow(sortedStars[i].x - sortedStars[next].x, 2) +
          Math.pow(sortedStars[i].y - sortedStars[next].y, 2)
      );

      if (distance < 300) {
        const exists = connections.some(
          (conn) =>
            (conn.x1 === sortedStars[i].x &&
              conn.y1 === sortedStars[i].y &&
              conn.x2 === sortedStars[next].x &&
              conn.y2 === sortedStars[next].y) ||
            (conn.x2 === sortedStars[i].x &&
              conn.y2 === sortedStars[i].y &&
              conn.x1 === sortedStars[next].x &&
              conn.y1 === sortedStars[next].y)
        );

        if (!exists) {
          connections.push({
            x1: sortedStars[i].x,
            y1: sortedStars[i].y,
            x2: sortedStars[next].x,
            y2: sortedStars[next].y,
          });
        }
      }
    }
  }

  return connections;
}
