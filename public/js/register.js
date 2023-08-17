// WEBCAMP
const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const similarityThreshold = 0.6;
let fullFaceDescriptions = null;

(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
})();

async function onPlay() {
    
    try {
        const MODEL_URL = '../models/';

        await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
        await faceapi.loadFaceLandmarkModel(MODEL_URL)
        await faceapi.loadFaceRecognitionModel(MODEL_URL)
        await faceapi.loadFaceExpressionModel(MODEL_URL)

        fullFaceDescriptions = await faceapi.detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions();


        const dims = faceapi.matchDimensions(canvas, video, true);
        const resizedResults = faceapi.resizeResults(fullFaceDescriptions, dims);

        faceapi.draw.drawDetections(canvas, resizedResults);
        faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
        faceapi.draw.drawFaceExpressions(canvas, resizedResults, 0.05);

        const userFaceDescriptions = fullFaceDescriptions[0].descriptor;
        let response = await fetch('/api/users');
        const storedUsersData = await response.json();

        let user = {
            "username": "usuario" + (storedUsersData.length + 1),
            "password": "password",
            "role": "user",
            "faceDescriptions": userFaceDescriptions
        }

        // Enviar el nuevo usuario al servidor para el registro
        response = await fetch('/api/register', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
  
      if (response.ok) {
        window.location.href = '/';
      } else {
        console.log('Error al registrar el usuario');
      }
        
    } catch (error) {
        console.log(error);
    }finally{
        setTimeout(() => onPlay(), 100)
    }
}

// Calcula la distancia euclidiana entre dos arreglos de números
function euclideanDistance(descriptor1, descriptor2) {
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    return Math.sqrt(sum);
}
