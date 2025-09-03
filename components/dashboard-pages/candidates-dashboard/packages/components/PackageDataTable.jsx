import React, { useEffect, useState } from "react";
import ApiService from "../../../../../services/api.service";

const PackageDataTable = () => {
  const [packages, setPackages] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pkgRes, subRes] = await Promise.all([
          ApiService.getSubscriptionPackages(),
          ApiService.getMySubscription(),
        ]);
        setPackages(pkgRes);
        setMySubscription(subRes);
      } catch (err) {
        setError("Unable to load service package data");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleBuyPackage = async (subscriptionTypeId) => {
    setBuyingId(subscriptionTypeId);
    try {
      const res = await ApiService.createPayment(subscriptionTypeId);
      if (res?.CheckoutUrl || res?.checkoutUrl) {
        window.location.href = res.CheckoutUrl || res.checkoutUrl;
      } else {
        alert("Unable to create payment!");
      }
    } catch (err) {
      alert("There was an error creating the payment!");
    }
    setBuyingId(null);
  };

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>{error}</div>;

  // Xác định gói hiện tại
  const currentPackageName = mySubscription?.IsSubscribed
    ? mySubscription.Subscription?.PackageName
    : null;

  return (
    <table className="default-table manage-job-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Package name</th>
          <th>Description</th>
          <th>Price (VNĐ)</th>
          <th>Duration (days)</th>
          <th>Try-matchesh</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {packages.map((pkg, idx) => {
          const isCurrent =
            mySubscription?.IsSubscribed &&
            mySubscription.Subscription?.PackageName === pkg.name;
          return (
            <tr key={pkg.subscriptionTypeId || pkg.SubscriptionTypeId}>
              <td>{idx + 1}</td>
              <td>{pkg.name}</td>
              <td>{pkg.description}</td>
              <td>{pkg.price}</td>
              <td>{pkg.durationInDays}</td>
              <td>{pkg.tryMatchLimit}</td>
              <td>
                {isCurrent ? (
                  <span style={{ color: "green", fontWeight: 600 }}>
                   In use
                  </span>
                ) : (
                  <button
                    className="btn btn-primary"
                    disabled={buyingId === (pkg.subscriptionTypeId || pkg.SubscriptionTypeId)}
                    onClick={() => handleBuyPackage(pkg.subscriptionTypeId || pkg.SubscriptionTypeId)}
                  >
                    {buyingId === (pkg.subscriptionTypeId || pkg.SubscriptionTypeId) ? "Processing..." : "Purchase/Register"}
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PackageDataTable;
