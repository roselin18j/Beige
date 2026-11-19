
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Package,
    Truck,
    Search,
    RefreshCw,
    Eye,
    Save,
    Trash2,
    X
} from "lucide-react";
import { toast } from "sonner";

import {
    getAllDeliveries,
    getDeliveryByOrderId,
    updateDeliveryStatus,
    updateTrackingDetails,
    deleteDelivery
} from "../../redux/slices/commonSlice";

const statusList = [
    "Ordered",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
];

const statusTransitions = {
    Ordered: ["Confirmed", "Cancelled"],
    Confirmed: ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Out for Delivery", "Cancelled"],
    "Out for Delivery": ["Delivered", "Cancelled"],
    Delivered: [],
    Cancelled: []
};

const statusStyle = {
    Ordered: "bg-gray-100 text-gray-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Processing: "bg-indigo-100 text-indigo-700",
    Shipped: "bg-amber-100 text-amber-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700"
};

const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN");
};

export default function Delivery() {
    const dispatch = useDispatch();

    const {
        deliveries,
        deliveryDetails,
        deliveryLoading
    } = useSelector((state) => state.common);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [showDetails, setShowDetails] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);

    const [selectedOrderId, setSelectedOrderId] = useState("");

    const [statusData, setStatusData] = useState({
        deliveryStatus: "",
        message: ""
    });

    const [trackingData, setTrackingData] = useState({
        trackingNumber: "",
        courierName: "",
        estimatedDeliveryDate: "",
        deliveryRemarks: ""
    });

    useEffect(() => {
        dispatch(getAllDeliveries())
            .unwrap()
            .catch((error) => {
                toast.error(error?.message || "Unable to fetch deliveries");
            });
    }, [dispatch]);

    const refreshDeliveries = () => {
        dispatch(getAllDeliveries())
            .unwrap()
            .then(() => toast.success("Deliveries refreshed"))
            .catch((error) => toast.error(error?.message || "Refresh failed"));
    };

    const filteredDeliveries = (deliveries || []).filter((item) => {
        const searchValue = search.toLowerCase();

        const matchesSearch =
            item.orderId?.toLowerCase().includes(searchValue) ||
            item.trackingNumber?.toLowerCase().includes(searchValue) ||
            item.courierName?.toLowerCase().includes(searchValue);

        const matchesStatus =
            !statusFilter || item.deliveryStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const statistics = [
        {
            title: "Total Deliveries",
            count: deliveries?.length || 0,
            icon: Package,
            color: "text-mocha",
            bg: "bg-mocha/10"
        },
        {
            title: "Processing",
            count: deliveries?.filter(
                (item) => item.deliveryStatus === "Processing"
            ).length || 0,
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "In Transit",
            count: deliveries?.filter(
                (item) =>
                    ["Shipped", "Out for Delivery"].includes(
                        item.deliveryStatus
                    )
            ).length || 0,
            icon: Truck,
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
        {
            title: "Delivered",
            count: deliveries?.filter(
                (item) => item.deliveryStatus === "Delivered"
            ).length || 0,
            icon: Package,
            color: "text-green-600",
            bg: "bg-green-50"
        }
    ];

    // View delivery details
    const handleView = async (orderId) => {
        try {
            setSelectedOrderId(orderId);

            await dispatch(getDeliveryByOrderId(orderId)).unwrap();

            setShowDetails(true);
        } catch (error) {
            toast.error(error?.message || "Unable to fetch delivery details");
        }
    };

    // Open update modal
    const handleUpdate = (item) => {
        setSelectedOrderId(item.orderId);

        setStatusData({
            deliveryStatus: "",
            message: ""
        });

        setTrackingData({
            trackingNumber: item.trackingNumber || "",
            courierName: item.courierName || "",
            estimatedDeliveryDate: item.estimatedDeliveryDate
                ? new Date(item.estimatedDeliveryDate)
                    .toISOString()
                    .split("T")[0]
                : "",
            deliveryRemarks: item.deliveryRemarks || ""
        });

        setShowUpdate(true);
    };

    // Update status
    const handleStatusUpdate = async () => {
        if (!statusData.deliveryStatus) {
            toast.error("Please select delivery status");
            return;
        }

        try {
            await dispatch(
                updateDeliveryStatus({
                    orderId: selectedOrderId,
                    ...statusData
                })
            ).unwrap();

            toast.success("Delivery status updated successfully");

            setShowUpdate(false);
            dispatch(getAllDeliveries());
        } catch (error) {
            toast.error(error?.message || "Unable to update status");
        }
    };

    // Update tracking
    const handleTrackingUpdate = async () => {
        try {
            await dispatch(
                updateTrackingDetails({
                    orderId: selectedOrderId,
                    ...trackingData
                })
            ).unwrap();

            toast.success("Tracking details updated successfully");

            setShowUpdate(false);
            dispatch(getAllDeliveries());
        } catch (error) {
            toast.error(error?.message || "Unable to update tracking");
        }
    };

    // Delete delivery
    const handleDelete = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this delivery?")) {
            return;
        }

        try {
            await dispatch(deleteDelivery(orderId)).unwrap();

            toast.success("Delivery deleted successfully");
        } catch (error) {
            toast.error(error?.message || "Unable to delete delivery");
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f7] p-4 md:p-6 lg:p-8">

            {/* Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-ink">
                        Delivery Management
                    </h1>

                    <p className="mt-1 text-sm text-muted">
                        Manage orders, shipments and delivery tracking.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={refreshDeliveries}
                    disabled={deliveryLoading}
                    className="flex items-center gap-2 border border-mocha px-4 py-3 text-sm text-mocha hover:bg-mocha hover:text-white disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={deliveryLoading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statistics.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="border border-line bg-white p-5"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted">
                                        {item.title}
                                    </p>

                                    <h2 className="mt-2 text-3xl font-semibold text-ink">
                                        {item.count}
                                    </h2>
                                </div>

                                <div className={`rounded-full p-3 ${item.bg} ${item.color}`}>
                                    <Icon size={23} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search and Filter */}
            <div className="mb-6 border border-line bg-white p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="relative md:col-span-2">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search order ID, tracking number or courier..."
                            className="w-full border border-line py-3 pl-11 pr-4 text-sm outline-none focus:border-mocha"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-mocha"
                    >
                        <option value="">All Delivery Status</option>

                        {statusList.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="border border-line bg-white">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <h2 className="font-semibold text-ink">
                        Delivery List
                    </h2>

                    <span className="text-sm text-muted">
                        {filteredDeliveries.length} records
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="bg-[#faf9f7] text-xs uppercase text-muted">
                            <tr>
                                <th className="px-5 py-4">Order ID</th>
                                <th className="px-5 py-4">Tracking Number</th>
                                <th className="px-5 py-4">Courier</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Expected Date</th>
                                <th className="px-5 py-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-line">
                            {deliveryLoading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-muted">
                                        Loading deliveries...
                                    </td>
                                </tr>
                            ) : filteredDeliveries.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-muted">
                                        No deliveries found
                                    </td>
                                </tr>
                            ) : (
                                filteredDeliveries.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="hover:bg-[#faf9f7]"
                                    >
                                        <td className="px-5 py-4 font-medium text-ink">
                                            {item.orderId}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-muted">
                                            {item.trackingNumber || "Not assigned"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-ink">
                                            {item.courierName || "Not assigned"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-block px-3 py-1.5 text-xs ${statusStyle[item.deliveryStatus] || "bg-gray-100 text-gray-700"}`}
                                            >
                                                {item.deliveryStatus}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-muted">
                                            {formatDate(item.estimatedDeliveryDate)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleView(item.orderId)}
                                                    className="border border-line p-2 text-mocha hover:bg-mocha hover:text-white"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdate(item)}
                                                    className="border border-line p-2 text-green-700 hover:bg-green-700 hover:text-white"
                                                    title="Update"
                                                >
                                                    <Save size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.orderId)}
                                                    className="border border-line p-2 text-red-600 hover:bg-red-600 hover:text-white"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {showDetails && deliveryDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6">

                        <div className="mb-6 flex justify-between">
                            <h2 className="text-xl font-semibold text-ink">
                                Delivery Details
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowDetails(false)}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-5 border-b border-line pb-5 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-muted">Order ID</p>
                                <p className="mt-1 font-medium text-ink">
                                    {deliveryDetails.orderId}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted">Delivery Status</p>
                                <span className={`mt-2 inline-block px-3 py-1 text-xs ${statusStyle[deliveryDetails.deliveryStatus]}`}>
                                    {deliveryDetails.deliveryStatus}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs text-muted">Tracking Number</p>
                                <p className="mt-1 text-sm text-ink">
                                    {deliveryDetails.trackingNumber || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted">Courier</p>
                                <p className="mt-1 text-sm text-ink">
                                    {deliveryDetails.courierName || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted">Shipped Date</p>
                                <p className="mt-1 text-sm text-ink">
                                    {formatDateTime(deliveryDetails.shippedDate)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted">Expected Delivery</p>
                                <p className="mt-1 text-sm text-ink">
                                    {formatDate(deliveryDetails.estimatedDeliveryDate)}
                                </p>
                            </div>
                        </div>

                        <h3 className="mb-5 mt-6 font-semibold text-ink">
                            Delivery History
                        </h3>

                        <div className="ml-2 border-l border-line pl-6">
                            {[...(deliveryDetails.statusHistory || [])]
                                .reverse()
                                .map((history, index) => (
                                    <div
                                        key={history._id || index}
                                        className="relative mb-6"
                                    >
                                        <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-mocha bg-white" />

                                        <h4 className="text-sm font-semibold text-ink">
                                            {history.deliveryStatus}
                                        </h4>

                                        <p className="mt-1 text-sm text-muted">
                                            {history.message}
                                        </p>

                                        <p className="mt-1 text-xs text-muted">
                                            {formatDateTime(history.updatedAt)}
                                        </p>
                                    </div>
                                ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowDetails(false)}
                            className="mt-4 w-full bg-mocha py-3 text-sm text-white hover:bg-ink"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Update Modal */}
            {showUpdate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white p-6">

                        <div className="mb-6 flex justify-between">
                            <h2 className="text-xl font-semibold text-ink">
                                Update Delivery
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowUpdate(false)}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <p className="mb-5 text-sm text-muted">
                            Order ID: {selectedOrderId}
                        </p>

                        <h3 className="mb-4 font-semibold text-ink">
                            Update Delivery Status
                        </h3>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm text-ink">
                                Delivery Status
                            </label>

                            <select
                                value={statusData.deliveryStatus}
                                onChange={(e) =>
                                    setStatusData({
                                        ...statusData,
                                        deliveryStatus: e.target.value
                                    })
                                }
                                className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-mocha"
                            >
                                <option value="">Select Status</option>

                                {(statusTransitions[
                                    deliveries.find(
                                        (item) => item.orderId === selectedOrderId
                                    )?.deliveryStatus
                                ] || []).map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-5">
                            <label className="mb-2 block text-sm text-ink">
                                Status Message
                            </label>

                            <textarea
                                rows="3"
                                value={statusData.message}
                                onChange={(e) =>
                                    setStatusData({
                                        ...statusData,
                                        message: e.target.value
                                    })
                                }
                                placeholder="Enter status message"
                                className="w-full resize-none border border-line px-4 py-3 text-sm outline-none focus:border-mocha"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleStatusUpdate}
                            disabled={deliveryLoading || !statusData.deliveryStatus}
                            className="w-full bg-mocha py-3 text-sm text-white hover:bg-ink disabled:opacity-50"
                        >
                            Update Status
                        </button>

                        <div className="my-6 border-t border-line" />

                        <h3 className="mb-4 font-semibold text-ink">
                            Tracking Information
                        </h3>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm text-ink">
                                Tracking Number
                            </label>

                            <input
                                value={trackingData.trackingNumber}
                                onChange={(e) =>
                                    setTrackingData({
                                        ...trackingData,
                                        trackingNumber: e.target.value
                                    })
                                }
                                placeholder="Enter tracking number"
                                className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-mocha"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm text-ink">
                                Courier Name
                            </label>

                            <input
                                value={trackingData.courierName}
                                onChange={(e) =>
                                    setTrackingData({
                                        ...trackingData,
                                        courierName: e.target.value
                                    })
                                }
                                placeholder="Enter courier name"
                                className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-mocha"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm text-ink">
                                Expected Delivery Date
                            </label>

                            <input
                                type="date"
                                value={trackingData.estimatedDeliveryDate}
                                onChange={(e) =>
                                    setTrackingData({
                                        ...trackingData,
                                        estimatedDeliveryDate: e.target.value
                                    })
                                }
                                className="w-full border border-line px-4 py-3 text-sm outline-none focus:border-mocha"
                            />
                        </div>

                        <div className="mb-5">
                            <label className="mb-2 block text-sm text-ink">
                                Delivery Remarks
                            </label>

                            <textarea
                                rows="3"
                                value={trackingData.deliveryRemarks}
                                onChange={(e) =>
                                    setTrackingData({
                                        ...trackingData,
                                        deliveryRemarks: e.target.value
                                    })
                                }
                                placeholder="Enter delivery remarks"
                                className="w-full resize-none border border-line px-4 py-3 text-sm outline-none focus:border-mocha"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleTrackingUpdate}
                            disabled={deliveryLoading}
                            className="w-full bg-mocha py-3 text-sm text-white hover:bg-ink disabled:opacity-50"
                        >
                            Save Tracking Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
