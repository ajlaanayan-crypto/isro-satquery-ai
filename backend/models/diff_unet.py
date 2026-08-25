import torch
import torch.nn as nn
import torch.nn.functional as F

class DoubleConv(nn.Module):
    """(Conv2d => BatchNorm => ReLU) * 2"""
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.conv(x)

class DifferenceUNet(nn.Module):
    """
    Siamese Difference U-Net Architecture for Remote Sensing Bi-Temporal Change Detection.
    Takes T1 (Optical) and T2 (SAR) image tensors and predicts a pixel-level change probability map.
    """
    def __init__(self, in_channels=3, num_classes=1):
        super().__init__()
        # Encoder (Shared weights)
        self.inc = DoubleConv(in_channels, 64)
        self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(64, 128))
        self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(128, 256))
        self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(256, 512))

        # Difference fusion & Decoder
        self.up1 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.conv_up1 = DoubleConv(512, 256)
        
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.conv_up2 = DoubleConv(256, 128)
        
        self.up3 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.conv_up3 = DoubleConv(128, 64)
        
        self.outc = nn.Conv2d(64, num_classes, 1)

    def forward(self, x_t1, x_t2):
        # 1. Extract multi-scale feature maps from T1 and T2
        feat1_t1 = self.inc(x_t1)
        feat2_t1 = self.down1(feat1_t1)
        feat3_t1 = self.down2(feat2_t1)
        bottleneck_t1 = self.down3(feat3_t1)

        feat1_t2 = self.inc(x_t2)
        feat2_t2 = self.down1(feat1_t2)
        feat3_t2 = self.down2(feat2_t2)
        bottleneck_t2 = self.down3(feat3_t2)

        # 2. Compute absolute difference matrix
        diff_bottleneck = torch.abs(bottleneck_t2 - bottleneck_t1)
        diff_feat3 = torch.abs(feat3_t2 - feat3_t1)
        diff_feat2 = torch.abs(feat2_t2 - feat2_t1)
        diff_feat1 = torch.abs(feat1_t1 - feat1_t2)

        # 3. Decode & Reconstruct spatial change tensor
        x = self.up1(diff_bottleneck)
        x = torch.cat([x, diff_feat3], dim=1)
        x = self.conv_up1(x)

        x = self.up2(x)
        x = torch.cat([x, diff_feat2], dim=1)
        x = self.conv_up2(x)

        x = self.up3(x)
        x = torch.cat([x, diff_feat1], dim=1)
        x = self.conv_up3(x)

        logits = self.outc(x)
        probabilities = torch.sigmoid(logits)
        return probabilities
