import React, { useState, useEffect, useCallback } from 'react';

// Add a simple random number generator
const mulberry32 = (a) => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Add the missing functions
const generateProblemType = (rng) => {
  const types = [
    { knowns: ['do', 'ho', 'di'], unknowns: ['f', 'hi', 'm'] },
    { knowns: ['f', 'do', 'ho'], unknowns: ['di', 'hi', 'm'] },
    { knowns: ['f', 'do', 'hi'], unknowns: ['di', 'ho', 'm'] },
    { knowns: ['f', 'di', 'ho'], unknowns: ['do', 'hi', 'm'] },
    { knowns: ['di', 'ho', 'm'], unknowns: ['do', 'hi', 'f'] },
    { knowns: ['do', 'hi', 'm'], unknowns: ['f', 'di', 'ho'] },
  ];
  return types[Math.floor(rng() * types.length)];
};

const calculateSALT = (lensType, focalLength, objectDistance, imageDistance, imageHeight, objectHeight) => {
  const f = Math.abs(focalLength);
  const do_ = objectDistance;
  const di = imageDistance;
  const hi = imageHeight;
  const ho = objectHeight;

  let size, attitude, location, type;

  // Size
  size = Math.abs(hi) > Math.abs(ho) ? "Larger" : Math.abs(hi) < Math.abs(ho) ? "Smaller" : "Same size";

  // Attitude
  attitude = hi * ho > 0 ? "Upright" : "Inverted";

  // Location and Type
  if (lensType === "converging") {
    if (do_ > 2*f) {
      location = "Between f and 2f";
      type = "Real";
    } else if (do_ === 2*f) {
      location = "At 2f";
      type = "Real";
    } else if (do_ < 2*f && do_ > f) {
      location = "Beyond 2f";
      type = "Real";
    } else if (do_ === f) {
      location = "No image formed";
      type = "No image";
    } else if (do_ < f) {
      location = "Same side as object";
      type = "Virtual";
    }
  } else { // diverging lens
    location = "Same side as object";
    type = "Virtual";
  }

  return { size, attitude, location, type };
};

const generateWordProblem = (seed) => {
  const rng = mulberry32(seed);

  const objects = ["pencil", "flower", "toy car", "book", "candle", "tin can", "statue"];
  const scenarios = [
    "In a physics lab, students are experimenting with a {lens_type} lens.",
    "An optometrist is demonstrating how a {lens_type} lens works in correcting vision.",
    "A photographer is using a {lens_type} lens to capture a unique perspective.",
    "At a science museum, visitors can interact with a large {lens_type} lens exhibit.",
    "During an optics lecture, a professor is explaining the properties of a {lens_type} lens.",
    "A jeweler is using a small {lens_type} lens to inspect the details of a gemstone.",
    "In a telescope, a {lens_type} lens is used to magnify distant objects.",
    "A student is learning about image formation using a {lens_type} lens in their physics class.",
    "At an optician's shop, different {lens_type} lenses are being demonstrated to a customer.",
    "In a microscope, a {lens_type} lens is used to magnify tiny specimens.",
    "A projector uses a {lens_type} lens to display images on a screen.",
    "In a camera, a {lens_type} lens is focusing light onto the image sensor.",
    "An artist is using a {lens_type} lens to create distorted images for a unique art piece.",
    "In a virtual reality headset, {lens_type} lenses are used to focus the display for the user's eyes."
  ];

  const lensType = rng() < 0.5 ? "converging" : "diverging";
  const objectChoice = objects[Math.floor(rng() * objects.length)];
  const scenario = scenarios[Math.floor(rng() * scenarios.length)].replace("{lens_type}", lensType);

  const isEasyProblem = rng() < 0.5;

  let focalLength, objectDistance;

  if (isEasyProblem) {
    const denominators = [2, 3, 4, 5, 6, 8, 10, 12];
    const firstDenominator = denominators[Math.floor(rng() * denominators.length)];
    const secondDenominator = denominators[Math.floor(rng() * denominators.length)];
    focalLength = lensType === "diverging" ? -firstDenominator : firstDenominator;
    objectDistance = secondDenominator;
  } else {
    focalLength = lensType === "diverging" ? -(rng() * 45 + 5) : (rng() * 45 + 5);
    objectDistance = rng() * 90 + 10;
    focalLength = Number(focalLength.toFixed(2));
    objectDistance = Number(objectDistance.toFixed(2));
  }

  // Perform calculations with full precision
  const imageDistance = 1 / (1 / focalLength - 1 / objectDistance);
  const magnification = -imageDistance / objectDistance;
  const objectHeight = Math.round(rng() * 9 + 1);
  const imageHeight = objectHeight * magnification;

  const problemType = generateProblemType(rng);

  const problemInfoMap = {
    lensType: `The lens is a ${lensType} lens.`,
    f: `The focal length of the lens is ${Math.abs(focalLength)} cm.`,
    do: `A ${objectChoice} is placed ${objectDistance} cm in front of the lens.`,
    ho: `The ${objectChoice} is ${objectHeight} cm tall.`,
    di: `An image is formed ${Math.abs(imageDistance.toFixed(2))} cm ${imageDistance > 0 ? 'on the same side' : 'on the opposite side'} of the lens as the object.`,
    hi: `The image is ${Math.abs(imageHeight.toFixed(2))} cm tall${imageHeight < 0 ? ' and inverted' : ''}.`,
    m: `The magnification of the lens is ${Math.abs(magnification.toFixed(2))}${magnification < 0 ? ' (inverted)' : ''}.`
  };

  const detailedInfoMap = {
    lensType: `Lens type: ${lensType}`,
    do: `do = ${objectDistance} cm`,
    f: `f = ${focalLength} cm`,
    ho: `ho = ${objectHeight} cm`,
    di: `di = ${imageDistance.toFixed(2)} cm`,
    hi: `hi = ${imageHeight.toFixed(2)} cm`,
    m: `m = ${magnification.toFixed(2)}`
  };

  const unknownFullWords = {
    do: "distance of object",
    f: "focal length",
    ho: "height of object",
    di: "distance of image",
    hi: "height of image",
    m: "magnification"
  };

  const formatUnknowns = (unknowns) => {
    if (unknowns.length === 1) {
      return unknownFullWords[unknowns[0]];
    } else if (unknowns.length === 2) {
      return `${unknownFullWords[unknowns[0]]} and ${unknownFullWords[unknowns[1]]}`;
    } else {
      const lastUnknown = unknownFullWords[unknowns[unknowns.length - 1]];
      const otherUnknowns = unknowns.slice(0, -1).map(u => unknownFullWords[u]).join(", ");
      return `${otherUnknowns}, and ${lastUnknown}`;
    }
  };

  let problemDescription = '';
  let remainingKnowns = [...problemType.knowns];
  let objectIntroduced = false;

  // Function to add info to the problem description and remove from remainingKnowns
  const addInfo = (key) => {
    if (remainingKnowns.includes(key)) {
      if (key === 'do') objectIntroduced = true;
      problemDescription += problemInfoMap[key] + ' ';
      remainingKnowns = remainingKnowns.filter(k => k !== key);
      return true;
    }
    return false;
  };

  // Add scenario first
  problemDescription = `${scenario} `;

  // Add 'f' if it's present
  addInfo('f');

  // Add 'do' next, either after 'f' or first if 'f' is not present
  addInfo('do');

  // If object hasn't been introduced and we're about to mention its height, introduce it
  if (!objectIntroduced && remainingKnowns.includes('ho')) {
    problemDescription += `A ${objectChoice} is placed in front of the lens. `;
    objectIntroduced = true;
  }
  addInfo('ho');
  // Add the rest of the knowns
  remainingKnowns.forEach(known => {
    if (known !== 'lensType') {  // lensType is already included in the scenario
      problemDescription += problemInfoMap[known] + ' ';
    }
  });

  // If the object still hasn't been introduced, add it at the end
  if (!objectIntroduced) {
    problemDescription += `A ${objectChoice} is placed in front of the lens. `;
  }

  const unknownsText = formatUnknowns(problemType.unknowns);
  const problem = `${problemDescription}Determine the ${unknownsText} for this lens system.`;

  const givenInfo = ['lensType', ...problemType.knowns];

  const equations = [
    "1. Thin Lens equation: 1/f = 1/di + 1/do",
    "2. Magnification equation: m = hi/ho = -di/do"
  ];

  const answers = {
    f: `Focal length (f): ${focalLength.toFixed(2)} cm`,
    do: `Object distance (do): ${objectDistance.toFixed(2)} cm`,
    ho: `Object height (ho): ${objectHeight.toFixed(2)} cm`,
    di: `Image distance (di): ${imageDistance.toFixed(2)} cm`,
    hi: `Image height (hi): ${imageHeight.toFixed(2)} cm`,
    m: `Magnification (m): ${magnification.toFixed(2)}`
  };

  const salt = calculateSALT(lensType, focalLength, objectDistance, imageDistance, imageHeight, objectHeight);

  return { 
    problem, 
    givenInfo, 
    problemInfoMap,
    detailedInfoMap, 
    equations, 
    problemType, 
    answers, 
    salt,
    isEasyProblem
  };
};

const LensProblemGenerator = () => {
  const [problem, setProblem] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [problemId, setProblemId] = useState(Math.floor(Math.random() * 1000000));
  const [inputId, setInputId] = useState('');

  const handleGenerateProblem = useCallback(() => {
    setProblem(generateWordProblem(problemId));
    setShowHelp(false);
    setShowAnswers(false);
  }, [problemId]);

  useEffect(() => {
    handleGenerateProblem();
  }, [handleGenerateProblem]);

  const handleRandomProblem = () => {
    const newId = Math.floor(Math.random() * 1000000);
    setProblemId(newId);
    setInputId(newId.toString());
  };

  const handleGenerateWithId = () => {
    const newId = parseInt(inputId);
    if (!isNaN(newId)) {
      setProblemId(newId);
    }
  };

  const toggleHelp = () => setShowHelp(!showHelp);
  const toggleAnswers = () => setShowAnswers(!showAnswers);
  const toggleControls = () => setShowControls(!showControls);

  if (!problem) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Lens Calculation Questions Practice</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
        <button
          onClick={toggleControls}
          className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>
        {showControls && (
          <div className="mt-4">
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <label htmlFor="problemId" className="block text-sm font-medium text-gray-700">Problem ID</label>
                <input
                  type="number"
                  id="problemId"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <button 
                onClick={handleGenerateWithId}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Generate with ID
              </button>
            </div>
          </div>
        )}
        <p className="text-sm text-gray-400">Current Problem ID: {problemId}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="font-bold mb-2">Problem</h2>
        <p>{problem.problem}</p>
        <p className="mt-2 text-sm text-gray-600">
          {problem.isEasyProblem ? "This is an easy (fraction-based) problem." : "This is a challenging (decimal-based) problem."}
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showHelp}
            onChange={toggleHelp}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Show Help</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showAnswers}
            onChange={toggleAnswers}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2">Show Answers</span>
        </label>
      </div>

      {showHelp && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="font-bold mb-2">Given Information</h2>
            <ul className="list-disc pl-5">
              {problem.givenInfo.map((info, index) => (
                <li key={index}>
                  {problem.detailedInfoMap[info]}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="font-bold mb-2">Equations to Use</h2>
            <ul className="list-disc pl-5">
              {problem.equations.map((equation, index) => (
                <li key={index}>{equation}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {showAnswers && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mt-6 mb-6">
            <h2 className="font-bold mb-2">Correct Answers</h2>
            <ul className="list-disc pl-5">
              {problem.problemType.unknowns.map((unknown, index) => (
                <li key={index}>{problem.answers[unknown]}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="font-bold mb-2">Image Characteristics (SALT)</h2>
            <ul className="list-disc pl-5">
              <li>Size: {problem.salt.size}</li>
              <li>Attitude: {problem.salt.attitude}</li>
              <li>Location: {problem.salt.location}</li>
              <li>Type: {problem.salt.type}</li>
            </ul>
          </div>
        </>
      )}
            <button 
        onClick={handleRandomProblem}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Random Problem
      </button>
    </div>
  );


};

export default LensProblemGenerator;