import axios from 'axios';

const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY;
const DELHIVERY_BASE_URL = 'https://track.delhivery.com/api/v1/packages/json/';

export const getTrackingInfo = async (courierName, trackingNumber) => {
  if (!DELHIVERY_API_KEY) {
    throw new Error('DELHIVERY_API_KEY is not configured');
  }

  if (courierName.toLowerCase() !== 'delhivery') {
    throw new Error('Currently only Delhivery courier is supported');
  }

  try {
    const response = await axios.post(
      `${DELHIVERY_BASE_URL}?waybill=${trackingNumber}&token=${DELHIVERY_API_KEY}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;
    if (!data || !data.ShipmentData || data.ShipmentData.length === 0) {
      return null;
    }

    const shipment = data.ShipmentData[0];
    const currentStatus = shipment.Status?.Status || 'In Transit';
    const location = shipment.Status?.Location || '';
    const estimatedDelivery = shipment.EstimatedDeliveryDate || null;

    const scanHistory = [];
    if (shipment.Scans && Array.isArray(shipment.Scans)) {
      shipment.Scans.forEach((scan) => {
        scanHistory.push({
          status: scan.Status || scan.ScanType || 'Update',
          location: scan.ScanDetail || location,
          timestamp: scan.ScannedDateTime || scan.Date || new Date().toISOString(),
          description: scan.Instructions || scan.Status || 'Package update',
        });
      });
    }

    return {
      status: currentStatus,
      location,
      estimatedDelivery,
      scanHistory: scanHistory.reverse(),
    };
  } catch (error) {
    console.error('Delhivery tracking API error:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch tracking information from Delhivery');
  }
};

export const detectCourier = async (trackingNumber) => {
  return [{ courierName: 'Delhivery', trackingNumber }];
};
