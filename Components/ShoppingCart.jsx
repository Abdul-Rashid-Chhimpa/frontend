                  type="button"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="w-full mt-2.5 py-2.5 rounded-xl font-semibold transition text-xs disabled:opacity-50"
                  style={{ border: `1px solid #E9C7C6`, color: "#B4302F" }}
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER POPUP */}
      {showOrderPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div
            className="rounded-3xl max-w-md w-full p-6 text-center relative"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <button
              type="button"
              onClick={() => {
                setShowOrderPopup(false);
                navigate("/");
              }}
              className="absolute top-4 right-4 rounded-full p-1.5 transition"
              style={{ background: SURFACE_MUTED, color: MUTED }}
            >
              <X size={18} />
            </button>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#E4F3E9" }}
            >
              <CheckCircle2 size={48} style={{ color: "#1D7A43" }} />
            </div>
            <h2
              className="text-2xl font-extrabold mb-1"
              style={{ color: INK }}
            >
              Order confirmed!
            </h2>
            <p className="text-xs mb-6" style={{ color: MUTED }}>
              Thank you for shopping with us. Your payment has been processed.
            </p>
            <div
              className="rounded-2xl p-4 text-left space-y-3 mb-6"
              style={{
                background: SURFACE_MUTED,
                border: `1px solid ${BORDER}`,
              }}
            >
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: MUTED }}>Order ID</span>
                <span className="font-bold" style={{ color: INK }}>
                  #{confirmedOrderData?.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: MUTED }}>Items ordered</span>
                <span className="font-semibold" style={{ color: INK }}>
                  {confirmedOrderData?.totalItems} item(s)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: MUTED }}>Amount paid</span>
                <span
                  className="font-bold text-sm"
                  style={{ color: AMBER_DARK }}
                >
                  ₹{confirmedOrderData?.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div
                className="pt-2 border-t flex items-center gap-2 text-xs font-medium"
                style={{ borderColor: BORDER, color: STEEL }}
              >
                <Truck size={16} />
                <span>Arriving soon at your doorstep!</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowOrderPopup(false);
                navigate("/");
              }}
              className="w-full font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 text-white"
              style={{ background: STEEL }}
            >
              <BagIcon size={16} /> Continue shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
