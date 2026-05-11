import { useEffect, useMemo, useState } from "react";
import styles from "../components/BookingPage.module.css";
import bookingBg from "../assets/booking-bg.jpeg";

const todayISODate = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const toISODate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getDateLabel = (dateString) => {
  const d = new Date(`${dateString}T12:00:00`);
  return d.toLocaleDateString("da-DK", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

export default function BookingPage() {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);

  const [barberId, setBarberId] = useState("");
  const [serviceIds, setServiceIds] = useState([]);
  const [date, setDate] = useState(todayISODate());
  const [slot, setSlot] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const nextDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return toISODate(d);
    });
  }, []);

  const selectedBarber = barbers.find((b) => b.id === barberId);

  const selectedServices = services.filter((s) => serviceIds.includes(s.id));

  const totalPrice = selectedServices.reduce((sum, s) => {
    return sum + Number(s.price || 0);
  }, 0);

  const totalDuration = selectedServices.reduce((sum, s) => {
    return sum + Number(s.durationMin || 0);
  }, 0);

  function toggleService(serviceId) {
    setServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }

      return [...prev, serviceId];
    });
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      try {
        const [bRes, sRes] = await Promise.all([
          fetch("/api/barbers"),
          fetch("/api/services"),
        ]);

        const b = await bRes.json();
        const s = await sRes.json();

        if (!b?.ok) throw new Error(b?.error || "Kunne ikke hente frisører");
        if (!s?.ok) throw new Error(s?.error || "Kunne ikke hente services");

        setBarbers(b.barbers || []);
        setServices(s.services || []);

        if ((b.barbers || []).length > 0) setBarberId(b.barbers[0].id);

        if ((s.services || []).length > 0) {
          setServiceIds([s.services[0].id]);
        }
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!barberId || !date) return;

    (async () => {
      setLoadingSlots(true);
      setErr("");
      setSlot("");

      try {
        const r = await fetch(`/api/availability?date=${date}&barberId=${barberId}`);
        const data = await r.json();

        if (!data?.ok) throw new Error(data?.error || "Kunne ikke hente tider");

        const now = new Date();
        const validSlots = (data.slots || []).filter((iso) => new Date(iso) > now);

        setSlots(validSlots);
      } catch (e) {
        setSlots([]);
        setErr(String(e?.message || e));
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [barberId, date]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!barberId || serviceIds.length === 0 || !slot || !name.trim()) {
      setErr("Vælg frisør, mindst én service, tid og skriv navn.");
      return;
    }

    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId,
          serviceIds,
          startISO: slot,
          customerName: name.trim(),
          customerPhone: phone.trim(),
        }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok || !data.ok) {
        throw new Error(data?.error || "Booking fejlede");
      }

      setMsg("✅ Booking oprettet! Vi har modtaget din booking.");
      setName("");
      setPhone("");
      setSlot("");

      const r2 = await fetch(`/api/availability?date=${date}&barberId=${barberId}`);
      const d2 = await r2.json();

      if (d2?.ok) {
        const now = new Date();
        setSlots((d2.slots || []).filter((iso) => new Date(iso) > now));
      }
    } catch (e) {
      setErr(String(e?.message || e));
    }
  }

  return (
    <div
      className={styles.page}
      style={{ backgroundImage: `url(${bookingBg})` }}
    >
      <section className={styles.phoneShell}>
        <header className={styles.topBar}>
          <span className={styles.backCircle}>‹</span>
          <h1>Book Now</h1>
        </header>

        <section className={styles.barberCard}>
          <div className={styles.avatar}>
            {selectedBarber?.name?.charAt(0) || "S"}
          </div>
          <div>
            <h2>{selectedBarber?.name || "ShortCut"}</h2>
            <p>📍 Gammel Kongevej 91C</p>
          </div>
        </section>

        <form onSubmit={submit} noValidate>
          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h3>Vælg frisør</h3>
            </div>

            <div className={styles.choiceGrid}>
              {barbers.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`${styles.choiceBtn} ${barberId === b.id ? styles.active : ""}`}
                  onClick={() => setBarberId(b.id)}
                  disabled={loading}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h3>Vælg service</h3>
            </div>

            <div className={styles.serviceGrid}>
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.serviceBtn} ${serviceIds.includes(s.id) ? styles.active : ""}`}
                  onClick={() => toggleService(s.id)}
                  disabled={loading}
                >
                  <span>{s.name}</span>
                  <strong>{s.price} kr</strong>
                </button>
              ))}
            </div>

            {selectedServices.length > 0 && (
              <p className={styles.muted} style={{ marginTop: "12px" }}>
                Samlet: {totalPrice} kr · {totalDuration} min
              </p>
            )}
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h3>Vælg dato</h3>
              <input
                className={styles.hiddenDate}
                type="date"
                min={todayISODate()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className={styles.dateRow}>
              {nextDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`${styles.dateBtn} ${date === day ? styles.active : ""}`}
                  onClick={() => setDate(day)}
                >
                  {getDateLabel(day)}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <h3>Ledige tider</h3>
            </div>

            {loadingSlots ? (
              <p className={styles.muted}>Henter tider...</p>
            ) : slots.length === 0 ? (
              <p className={styles.muted}>Ingen ledige tider på denne dag.</p>
            ) : (
              <div className={styles.slotGrid}>
                {slots.map((iso) => (
                  <button
                    key={iso}
                    type="button"
                    className={`${styles.slotBtn} ${slot === iso ? styles.active : ""}`}
                    onClick={() => setSlot(iso)}
                  >
                    {formatTime(iso)}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles.sectionBlock}>
            <div className={styles.inputGrid}>
              <label className={styles.field}>
                <span>Navn</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dit navn"
                  autoComplete="name"
                />
              </label>

              <label className={styles.field}>
                <span>Telefon</span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="12 34 56 78"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </label>
            </div>
          </section>

          {err && <p className={styles.error}>{err}</p>}
          {msg && <p className={styles.success}>{msg}</p>}

          <button className={styles.confirmBar} type="submit">
            <span>›</span>
            <strong>
              Book {selectedServices.length > 0 ? selectedServices.length : ""} service
              {selectedServices.length > 1 ? "s" : ""} · {totalPrice} kr
            </strong>
            <em>{slot ? formatTime(slot) : "Vælg tid"}</em>
          </button>
        </form>
      </section>
    </div>
  );
}