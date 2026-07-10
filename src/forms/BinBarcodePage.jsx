import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarcodeDetailsPage } from "./BarcodeDetailsPage";

export default function BinBarcodePage() {
  const { barcode } = useParams();
  const navigate = useNavigate();
  return <BarcodeDetailsPage barcode={barcode} onClose={() => navigate("/wms/barcode-dashboard")} />;
}
