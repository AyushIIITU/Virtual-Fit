from fastapi import FastAPI, File, UploadFile
import uvicorn
from io import BytesIO
from FoodClassifer import classify_image_file
app = FastAPI()



@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    image_data = await file.read()
    classify_image = classify_image_file(BytesIO(image_data))
    return classify_image

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
