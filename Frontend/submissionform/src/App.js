import React, { useState, useRef } from "react";
import "./App.css";

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  contact: "",
  gender: "",
  subjects: { English: false, Maths: false, Physics: false },
  resume: null,
  url: "",
  select: "",
  about: "",
};

function App() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && ["English", "Maths", "Physics"].includes(name)) {
      setForm((s) => ({ ...s, subjects: { ...s.subjects, [name]: checked } }));
      return;
    }
    if (type === "radio") {
      setForm((s) => ({ ...s, [name]: value }));
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleContactChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setForm((s) => ({ ...s, contact: digits }));
    validateField("contact", digits);
  };

  const validateField = (name, value) => {
    let msg = "";
    if (name === "firstName" || name === "lastName") {
      if (!value || !value.trim()) msg = "This field is required.";
      else if (value.trim().length < 2) msg = "Must be at least 2 characters.";
    } else if (name === "email") {
      if (!value) msg = "Email is required.";
      else {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(value)) msg = "Enter a valid email address.";
      }
    } else if (name === "contact") {
      if (!value) msg = "Number is required.";
      else {
        const digits = value.replace(/\D/g, "");
        if (digits.length < 7 || digits.length > 15)
          msg = "Enter a valid phone number (7-15 digits).";
      }
    } else if (name === "gender") {
      if (!value) msg = "Select a gender.";
    } else if (name === "resume") {
      if (!value) msg = "Resume is required.";
      else {
        const allowed = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (value.size && value.size > 2 * 1024 * 1024)
          msg = "File must be smaller than 2MB.";
        else if (value.type && !allowed.includes(value.type))
          msg = "Allowed file types: PDF, DOC, DOCX.";
      }
    } else if (name === "url") {
      if (!value) msg = "URL is required.";
      else {
        try {
          // eslint-disable-next-line no-new
          new URL(value);
        } catch (_) {
          msg = "Enter a valid URL (include http:// or https://).";
        }
      }
    } else if (name === "select") {
      if (!value) msg = "Please select an option.";
    } else if (name === "about") {
      if (value && value.length > 500)
        msg = "About must be 500 characters or less.";
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === "";
  };

  const handleFile = (e) => {
    const file = e.target.files[0] || null;
    setForm((s) => ({ ...s, resume: file }));
    validateField("resume", file);
  };

  const validateAll = () => {
    const fields = [
      "firstName",
      "lastName",
      "email",
      "contact",
      "gender",
      "resume",
      "url",
      "select",
      "about",
    ];
    let valid = true;
    fields.forEach((f) => {
      const v = f === "resume" ? form.resume : form[f];
      const ok = validateField(f, v);
      if (!ok) valid = false;
    });
    return valid;
  };

  const handleReset = () => {
    setForm(initial);
    if (fileRef.current) fileRef.current.value = "";
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = validateAll();
    if (!ok) return;
    (async () => {
      const fd = new FormData();
      fd.append("firstName", form.firstName);
      fd.append("lastName", form.lastName);
      fd.append("email", form.email);
      fd.append("contact", form.contact);
      fd.append("gender", form.gender);
      fd.append("subjects", JSON.stringify(form.subjects));
      if (form.resume) fd.append("resume", form.resume);
      fd.append("url", form.url);
      fd.append("select", form.select);
      fd.append("about", form.about);

      try {
        const res = await fetch("http://localhost:5000/api/forms", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmitMessage(data.message || "Submission failed");
          return;
        }
        setSubmitMessage("Submitted successfully");
        setForm(initial);
        if (fileRef.current) fileRef.current.value = "";
        setErrors({});
      } catch (err) {
        setSubmitMessage("Network error");
      }
    })();
  };

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">Form in React</div>
        <form className="card-body" onSubmit={handleSubmit} noValidate>
          <div className="row">
            <label>
              First Name<span className="req">*</span>
            </label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={(e) => {
                handleChange(e);
                validateField("firstName", e.target.value);
              }}
              placeholder="Enter First Name"
              aria-invalid={errors.firstName ? "true" : "false"}
              aria-describedby={errors.firstName ? "err-firstName" : undefined}
            />
            {errors.firstName && (
              <div id="err-firstName" className="error">
                {errors.firstName}
              </div>
            )}
          </div>

          <div className="row">
            <label>
              Last Name<span className="req">*</span>
            </label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={(e) => {
                handleChange(e);
                validateField("lastName", e.target.value);
              }}
              placeholder="Enter Last Name"
              aria-invalid={errors.lastName ? "true" : "false"}
              aria-describedby={errors.lastName ? "err-lastName" : undefined}
            />
            {errors.lastName && (
              <div id="err-lastName" className="error">
                {errors.lastName}
              </div>
            )}
          </div>

          <div className="row">
            <label>
              Enter Email<span className="req">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => {
                handleChange(e);
                validateField("email", e.target.value);
              }}
              placeholder="Enter email"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "err-email" : undefined}
            />
            {errors.email && (
              <div id="err-email" className="error">
                {errors.email}
              </div>
            )}
          </div>

          <div className="row">
            <label>Contact*</label>
            <input
              name="contact"
              type="tel"
              inputMode="numeric"
              pattern="\d*"
              value={form.contact}
              onChange={handleContactChange}
              placeholder="Enter Mobile number"
              aria-invalid={errors.contact ? "true" : "false"}
              aria-describedby={errors.contact ? "err-contact" : undefined}
            />
            {errors.contact && (
              <div id="err-contact" className="error">
                {errors.contact}
              </div>
            )}
          </div>

          <div className="row inline">
            <label>Gender*</label>
            <div className="options">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={form.gender === "Male"}
                  onChange={(e) => {
                    handleChange(e);
                    validateField("gender", e.target.value);
                  }}
                />{" "}
                Male
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={form.gender === "Female"}
                  onChange={(e) => {
                    handleChange(e);
                    validateField("gender", e.target.value);
                  }}
                />{" "}
                Female
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={form.gender === "Other"}
                  onChange={(e) => {
                    handleChange(e);
                    validateField("gender", e.target.value);
                  }}
                />{" "}
                Other
              </label>
            </div>
            {errors.gender && (
              <div id="err-gender" className="error">
                {errors.gender}
              </div>
            )}
          </div>

          <div className="row inline">
            <label>Your best Subject</label>
            <div className="options">
              <label>
                <input
                  type="checkbox"
                  name="English"
                  checked={form.subjects.English}
                  onChange={handleChange}
                />{" "}
                English
              </label>
              <label>
                <input
                  type="checkbox"
                  name="Maths"
                  checked={form.subjects.Maths}
                  onChange={handleChange}
                />{" "}
                Maths
              </label>
              <label>
                <input
                  type="checkbox"
                  name="Physics"
                  checked={form.subjects.Physics}
                  onChange={handleChange}
                />{" "}
                Physics
              </label>
            </div>
          </div>

          <div className="row">
            <label>Upload Resume*</label>
            <input
              id="resume"
              ref={fileRef}
              type="file"
              onChange={handleFile}
              aria-invalid={errors.resume ? "true" : "false"}
              aria-describedby={errors.resume ? "err-resume" : undefined}
            />
            {errors.resume && (
              <div id="err-resume" className="error">
                {errors.resume}
              </div>
            )}
          </div>

          <div className="row">
            <label>Enter URL*</label>
            <input
              name="url"
              type="url"
              value={form.url}
              onChange={(e) => {
                handleChange(e);
                validateField("url", e.target.value);
              }}
              placeholder="Enter url"
              aria-invalid={errors.url ? "true" : "false"}
              aria-describedby={errors.url ? "err-url" : undefined}
            />
            {errors.url && (
              <div id="err-url" className="error">
                {errors.url}
              </div>
            )}
          </div>

          <div className="row">
            <label>Select your choice</label>
            <select
              name="select"
              value={form.select}
              onChange={(e) => {
                handleChange(e);
                validateField("select", e.target.value);
              }}
              aria-invalid={errors.select ? "true" : "false"}
              aria-describedby={errors.select ? "err-select" : undefined}
            >
              <option value="">Select your Ans</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
            {errors.select && (
              <div id="err-select" className="error">
                {errors.select}
              </div>
            )}
          </div>

          <div className="row">
            <label>About</label>
            <textarea
              name="about"
              value={form.about}
              onChange={(e) => {
                handleChange(e);
                validateField("about", e.target.value);
              }}
              placeholder="About your self"
            />
            {errors.about && (
              <div id="err-about" className="error">
                {errors.about}
              </div>
            )}
          </div>

          <div className="row buttons">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
          {submitMessage && (
            <div className="row">
              <div className="error">{submitMessage}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default App;
