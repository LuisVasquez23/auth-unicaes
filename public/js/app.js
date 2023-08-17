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
        const response = await fetch('/api/users');
        const storedUsersData = await response.json();

        // Compara el descriptor del usuario autenticado con los descriptores almacenados
        let isAuthenticated = false;
        let usuarioLogeado = "";

        for (const storedDescriptor of storedUsersData) {
            const distance = euclideanDistance(userFaceDescriptions, storedDescriptor.faceDescriptions);

            usuarioLogeado = {
                "username": storedDescriptor.username,
                "password": storedDescriptor.password,
                "role": storedDescriptor.role,
            };

            if (distance <= similarityThreshold) {
                isAuthenticated = true;
                break; // Puedes romper el ciclo si se encuentra una coincidencia
            }
        }

        if (isAuthenticated) {
            // Enviar objeto de usuario autenticado al servidor
            const response = await fetch('/reconocimiento_facial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuarioLogeado)
            });

            if (response.ok) {
                window.location.href = '/dashboard';
            } else {
                console.log('Error al enviar los datos al servidor');
            }
        } else {
            console.log('Autenticación fallida');
        }
        


    } catch (error) {
        console.log(error);
    }finally{
        setTimeout(() => onPlay(), 2000)
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
