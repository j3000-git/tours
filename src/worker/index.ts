import { Hono } from "hono";
import { cors } from "hono/cors";
import { BookingRequestSchema } from "@/shared/types";
import { z } from "zod";
import { getCookie, setCookie } from "hono/cookie";

type Variables = {
  admin?: any;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", cors({
  origin: "*",
  credentials: true,
}));

// Admin authentication middleware
const adminAuthMiddleware = async (c: any, next: any) => {
  const adminToken = getCookie(c, "admin_session");
  
  if (!adminToken) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  try {
    const db = c.env.DB;
    const admin = await db.prepare("SELECT * FROM admin_users WHERE username = ? AND is_active = 1").bind(adminToken).first();
    
    if (!admin) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    c.set("admin", admin);
    await next();
  } catch (error) {
    return c.json({ error: "Unauthorized" }, 401);
  }
};

// Admin login
app.post("/api/admin/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: "Username and password required" }, 400);
    }
    
    const db = c.env.DB;
    const admin = await db.prepare("SELECT * FROM admin_users WHERE username = ? AND is_active = 1").bind(username).first();
    
    if (!admin) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    // For simplicity, using base64 comparison (in production, use proper bcrypt)
    const storedPassword = atob(admin.password_hash as string);
    
    if (password !== storedPassword) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    setCookie(c, "admin_session", username, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return c.json({ 
      success: true, 
      admin: {
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Admin logout
app.post("/api/admin/logout", async (c) => {
  setCookie(c, "admin_session", "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });
  
  return c.json({ success: true });
});

// Get current admin
app.get("/api/admin/me", adminAuthMiddleware, async (c) => {
  const admin = c.get("admin");
  return c.json({
    username: admin.username,
    email: admin.email
  });
});

// Get all tours (admin - includes inactive)
app.get("/api/admin/tours", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare("SELECT * FROM tours ORDER BY created_at DESC").all();
    
    const tours = result.results.map(tour => ({
      ...tour,
      is_featured: Boolean(tour.is_featured),
      is_active: Boolean(tour.is_active),
    }));
    
    return c.json({ tours });
  } catch (error) {
    console.error("Error fetching tours:", error);
    return c.json({ error: "Failed to fetch tours" }, 500);
  }
});

// Create tour (admin)
app.post("/api/admin/tours", adminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const db = c.env.DB;
    
    const result = await db.prepare(`
      INSERT INTO tours (title, description, location, duration_days, price, max_guests, image_url, highlights, included, gallery_images, gallery_videos, is_featured, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.title,
      body.description,
      body.location,
      body.duration_days,
      body.price,
      body.max_guests,
      body.image_url || null,
      body.highlights ? JSON.stringify(body.highlights) : null,
      body.included ? JSON.stringify(body.included) : null,
      body.gallery_images ? JSON.stringify(body.gallery_images) : null,
      body.gallery_videos ? JSON.stringify(body.gallery_videos) : null,
      body.is_featured ? 1 : 0,
      body.is_active ? 1 : 0
    ).run();
    
    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (error) {
    console.error("Error creating tour:", error);
    return c.json({ error: "Failed to create tour" }, 500);
  }
});

// Update tour (admin)
app.put("/api/admin/tours/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const db = c.env.DB;
    
    await db.prepare(`
      UPDATE tours 
      SET title = ?, description = ?, location = ?, duration_days = ?, price = ?, max_guests = ?, 
          image_url = ?, highlights = ?, included = ?, gallery_images = ?, gallery_videos = ?, 
          is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.title,
      body.description,
      body.location,
      body.duration_days,
      body.price,
      body.max_guests,
      body.image_url || null,
      body.highlights ? JSON.stringify(body.highlights) : null,
      body.included ? JSON.stringify(body.included) : null,
      body.gallery_images ? JSON.stringify(body.gallery_images) : null,
      body.gallery_videos ? JSON.stringify(body.gallery_videos) : null,
      body.is_featured ? 1 : 0,
      body.is_active ? 1 : 0,
      id
    ).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating tour:", error);
    return c.json({ error: "Failed to update tour" }, 500);
  }
});

// Delete tour (admin)
app.delete("/api/admin/tours/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const db = c.env.DB;
    
    await db.prepare("DELETE FROM tours WHERE id = ?").bind(id).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting tour:", error);
    return c.json({ error: "Failed to delete tour" }, 500);
  }
});

// Get all bookings (admin)
app.get("/api/admin/bookings", adminAuthMiddleware, async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare(`
      SELECT b.*, t.title as tour_title, t.location as tour_location
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.id
      ORDER BY b.created_at DESC
    `).all();
    
    return c.json({ bookings: result.results });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return c.json({ error: "Failed to fetch bookings" }, 500);
  }
});

// Update booking status (admin)
app.put("/api/admin/bookings/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const { status } = await c.req.json();
    const db = c.env.DB;
    
    await db.prepare(`
      UPDATE bookings 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(status, id).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating booking:", error);
    return c.json({ error: "Failed to update booking" }, 500);
  }
});

// Delete booking (admin)
app.delete("/api/admin/bookings/:id", adminAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const db = c.env.DB;
    
    await db.prepare("DELETE FROM bookings WHERE id = ?").bind(id).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return c.json({ error: "Failed to delete booking" }, 500);
  }
});

// Public endpoints below

// Get all tours
app.get("/api/tours", async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare("SELECT * FROM tours WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC").all();
    
    const tours = result.results.map(tour => ({
      ...tour,
      is_featured: Boolean(tour.is_featured),
      is_active: Boolean(tour.is_active),
      highlights: tour.highlights ? JSON.parse(tour.highlights as string) : [],
      included: tour.included ? JSON.parse(tour.included as string) : []
    }));
    
    return c.json({ tours });
  } catch (error) {
    console.error("Error fetching tours:", error);
    return c.json({ error: "Failed to fetch tours" }, 500);
  }
});

// Get single tour
app.get("/api/tours/:id", async (c) => {
  try {
    const db = c.env.DB;
    const id = parseInt(c.req.param("id"));
    
    if (isNaN(id)) {
      return c.json({ error: "Invalid tour ID" }, 400);
    }
    
    const result = await db.prepare("SELECT * FROM tours WHERE id = ? AND is_active = 1").bind(id).first();
    
    if (!result) {
      return c.json({ error: "Tour not found" }, 404);
    }
    
    const tour = {
      ...result,
      is_featured: Boolean(result.is_featured),
      is_active: Boolean(result.is_active),
      highlights: result.highlights ? JSON.parse(result.highlights as string) : [],
      included: result.included ? JSON.parse(result.included as string) : []
    };
    
    return c.json({ tour });
  } catch (error) {
    console.error("Error fetching tour:", error);
    return c.json({ error: "Failed to fetch tour" }, 500);
  }
});

// Create booking
app.post("/api/bookings", async (c) => {
  try {
    const body = await c.req.json();
    const bookingData = BookingRequestSchema.parse(body);
    
    const db = c.env.DB;
    
    // Get tour details to calculate total price
    const tour = await db.prepare("SELECT * FROM tours WHERE id = ? AND is_active = 1").bind(bookingData.tour_id).first();
    
    if (!tour) {
      return c.json({ error: "Tour not found" }, 404);
    }
    
    const totalPrice = (tour.price as number) * bookingData.guest_count;
    
    // Insert booking
    const result = await db.prepare(`
      INSERT INTO bookings (tour_id, guest_name, guest_email, guest_phone, guest_count, preferred_date, message, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      bookingData.tour_id,
      bookingData.guest_name,
      bookingData.guest_email,
      bookingData.guest_phone,
      bookingData.guest_count,
      bookingData.preferred_date,
      bookingData.message,
      totalPrice
    ).run();
    
    // Generate WhatsApp message
    const whatsappMessage = encodeURIComponent(
      `🏛️ New Tour Booking Request!\n\n` +
      `Tour: ${tour.title}\n` +
      `Guest: ${bookingData.guest_name}\n` +
      `Email: ${bookingData.guest_email}\n` +
      `Phone: ${bookingData.guest_phone}\n` +
      `Guests: ${bookingData.guest_count}\n` +
      `Preferred Date: ${bookingData.preferred_date || 'Flexible'}\n` +
      `Total Price: ${totalPrice} SAR\n` +
      `Message: ${bookingData.message || 'None'}\n\n` +
      `Booking ID: ${result.meta.last_row_id}`
    );
    
    return c.json({ 
      success: true, 
      booking_id: result.meta.last_row_id,
      whatsapp_url: `https://wa.me/966500000000?text=${whatsappMessage}`,
      total_price: totalPrice
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid booking data", details: error.errors }, 400);
    }
    console.error("Error creating booking:", error);
    return c.json({ error: "Failed to create booking" }, 500);
  }
});

// Upload file to R2
app.post("/api/admin/upload", adminAuthMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'image' or 'video'
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    
    if (!type || !["image", "video"].includes(type)) {
      return c.json({ error: "Invalid file type" }, 400);
    }
    
    // Validate file type
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/mov", "video/avi"];
    const allowedTypes = type === "image" ? allowedImageTypes : allowedVideoTypes;
    
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: `Invalid ${type} format` }, 400);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const filename = `tours/${type}s/${timestamp}_${randomStr}.${extension}`;
    
    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.R2_BUCKET.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Return public URL
    const publicUrl = `/api/files/${filename}`;
    
    return c.json({ 
      success: true, 
      url: publicUrl,
      filename: filename 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Serve files from R2
app.get("/api/files/*", async (c) => {
  try {
    const path = c.req.path.replace("/api/files/", "");
    const object = await c.env.R2_BUCKET.get(path);
    
    if (!object) {
      return c.notFound();
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=31536000"); // 1 year cache
    
    return c.body(object.body, { headers });
  } catch (error) {
    console.error("File serve error:", error);
    return c.notFound();
  }
});

// Delete file from R2
app.delete("/api/admin/files/:filename", adminAuthMiddleware, async (c) => {
  try {
    const filename = c.req.param("filename");
    await c.env.R2_BUCKET.delete(filename);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return c.json({ error: "Delete failed" }, 500);
  }
});

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "healthy" });
});

export default app;
