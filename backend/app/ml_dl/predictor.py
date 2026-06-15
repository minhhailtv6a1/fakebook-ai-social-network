from app.ml_dl.sentiment_model import (
    model,
    tokenizer
)

import torch


def predict_sentiment(text: str):

    inputs = tokenizer(
        text,
        truncation=True,
        padding=True,
        max_length=128,
        return_tensors="pt"
    )

    if "token_type_ids" in inputs:
        del inputs["token_type_ids"]

    with torch.no_grad():
        outputs = model(**inputs)

    pred = torch.argmax(
                outputs,
                dim=1
            )


    return pred.item()