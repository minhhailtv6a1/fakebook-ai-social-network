from transformers import AutoModel
import torch.nn as nn

class PhoBert(nn.Module):

    def __init__(
        self,
        dropout_p=0.3,
        num_classes=5
    ):

        super().__init__()

        self.embedding = AutoModel.from_pretrained(
            "vinai/phobert-base"
        )

        # self.dropout = nn.Dropout(
        #     dropout_p
        # )

        # self.fc = nn.Linear(
        #     768,
        #     num_classes
        # )

        self.classifier = nn.Sequential(
            nn.Dropout(dropout_p),
            nn.Linear(768, 256),
            nn.ReLU(),
            nn.Dropout(dropout_p),
            nn.Linear(256, num_classes)
        )

    def forward(
        self,
        input_ids,
        attention_mask
    ):

        outputs = self.embedding(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # lấy CLS token
        cls_output = outputs.last_hidden_state[:, 0, :]

        logits = self.classifier(cls_output)

        return logits