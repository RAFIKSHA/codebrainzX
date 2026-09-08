import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, User, Mail, Phone, BookOpen, ArrowRight, ArrowLeft, CheckCircle, CreditCard, QrCode, Plus, Trash2, Copy, Check, ShieldAlert, Loader, FileText, ChevronLeft, Sparkles, Clock, AlertCircle, Layers, X, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

interface Hackathon {
  id: number;
  title: string;
  slug: string;
  registration_fee: string;
  max_teams: number;
  max_team_members: number;
  registered_teams_count: number;
  status: string;
  theme: string;
  mode: string;
  venue: string;
  difficulty: string;
  registration_deadline: string;
}

interface MemberForm {
  name: string;
  email: string;
  phone: string;
  college: string;
}

const HackathonRegister: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Route query params
  const paramStep = searchParams.get('step');
  const paramTeamId = searchParams.get('team_id');

  // Wizard Steps:
  // 1: Team Info
  // 2: Leader Profile
  // 3: Team Members
  // 4: Socials & Resume (Documents)
  // 5: Payment Gateway
  // 6: Review Details
  // 7: Success Page
  const [step, setStep] = useState(1);
  const [teamId, setTeamId] = useState<number | null>(null);

  // States
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  // Problem Selection States
  const [problemStatements, setProblemStatements] = useState<any[]>([]);
  const [problemStatementId, setProblemStatementId] = useState<number | null>(null);
  const [confirmProblem, setConfirmProblem] = useState(false);
  const [viewingProblem, setViewingProblem] = useState<any | null>(null);
  const [selectedProblem, setSelectedProblemState] = useState<any | null>(null);
  const setSelectedProblem = (ps: any) => {
    setSelectedProblemState(ps);
    setProblemStatementId(ps ? ps.id : null);
  };

  // Form Fields - Step 2 (formerly Step 1)
  const [teamName, setTeamName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('1st');

  // Leader Details - Step 3 (formerly Step 2)
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderMobile, setLeaderMobile] = useState('');
  const [leaderRollNumber, setLeaderRollNumber] = useState('');

  // Members - Step 4 (formerly Step 3)
  const [members, setMembers] = useState<MemberForm[]>([
    { name: '', email: '', phone: '', college: '' },
    { name: '', email: '', phone: '', college: '' }
  ]);

  // Documents/Socials - Step 5 (formerly Step 4)
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  // Payment Details - Step 6 (formerly Step 5)
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('upi');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [merchantUpiId, setMerchantUpiId] = useState('upi-id@bank');
  const [merchantName, setMerchantName] = useState('CodexPetra');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Success Info - Step 8 (formerly Step 7)
  const [successInfo, setSuccessInfo] = useState<{
    payment_id: string;
    invoice_number: string;
    registration_number: string;
    amount: number;
    status: string;
  } | null>(null);

  // Load Hackathon & UPI Details
  useEffect(() => {
    const fetchHackathon = async () => {
      setLoading(true);
      try {
        const listRes = await api.get('/hackathons/');
        const match = listRes.data.find((h: Hackathon) => h.slug === slug);
        if (match) {
          setHackathon(match);
          
          // Load problem statements
          try {
            const psRes = await api.get(`/hackathon-problem-statements/?hackathon_id=${match.id}`);
            setProblemStatements(psRes.data.filter((ps: any) => ps.active !== false));
          } catch (e) {
            console.error("Failed to load problem statements.", e);
          }

          // Check if resuming from an external payment redirection
          if (paramStep === '6' && paramTeamId) {
            setTeamId(parseInt(paramTeamId));
            setStep(6);
            await fetchTeamDetails(parseInt(paramTeamId));
          } else {
            // Check if there is an existing registered team on the server for this hackathon
            let hasServerTeam = false;
            try {
              const myRegs = await api.get('/hackathon-teams/my_registrations/');
              const existingTeam = myRegs.data.find((t: any) => t.hackathon === match.id);
              if (existingTeam) {
                hasServerTeam = true;
                setTeamId(existingTeam.id);
                setTeamName(existingTeam.name || '');
                setCollege(existingTeam.college || '');
                setDepartment(existingTeam.department || '');
                setYear(existingTeam.year || '1st');
                setLeaderName(existingTeam.leader_name || '');
                setLeaderEmail(existingTeam.leader_email || '');
                setLeaderMobile(existingTeam.leader_mobile || '');
                setLeaderRollNumber(existingTeam.leader_roll_number || '');
                setProblemStatementId(existingTeam.problem_statement || null);
                setConfirmProblem(!!existingTeam.problem_statement);
                
                const loadedMembers = existingTeam.members || [];
                while (loadedMembers.length < 2) {
                  loadedMembers.push({ name: '', email: '', phone: '', college: '' });
                }
                setMembers(loadedMembers);

                setGithubUrl(existingTeam.github_url || '');
                setLinkedinUrl(existingTeam.linkedin_url || '');
                setResumeUrl(existingTeam.resume_url || '');
              }
            } catch (regErr) {
              console.error("Failed to check existing registrations", regErr);
            }

            if (!hasServerTeam) {
              // Check for drafts in localStorage
              const savedDraft = localStorage.getItem(`hackathon_draft_${slug}`);
              if (savedDraft) {
                setShowDraftPrompt(true);
              }
            }
          }
        } else {
          setError("Hackathon not found.");
        }

        // Fetch UPI address
        try {
          const upiRes = await api.get('/hackathon-payments/upi_config/');
          setMerchantUpiId(upiRes.data.upi_id);
          setMerchantName(upiRes.data.merchant_name);
        } catch (e) {
          console.error("Failed to load merchant UPI configuration.", e);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load hackathon details.");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [slug, paramStep, paramTeamId]);

  // Pre-fill leader email/name from context
  useEffect(() => {
    if (user && !leaderName && !leaderEmail) {
      setLeaderName(user.username || '');
      setLeaderEmail(user.email || '');
    }
  }, [user]);

  // Auto-Save Draft to LocalStorage
  useEffect(() => {
    if (step >= 1 && step <= 4 && hackathon) {
      const draftState = {
        teamName,
        college,
        department,
        year,
        leaderName,
        leaderEmail,
        leaderMobile,
        leaderRollNumber,
        members,
        githubUrl,
        linkedinUrl,
        resumeUrl
      };
      localStorage.setItem(`hackathon_draft_${slug}`, JSON.stringify(draftState));
    }
  }, [
    step, teamName, college, department, year, leaderName, leaderEmail,
    leaderMobile, leaderRollNumber, members, githubUrl, linkedinUrl, resumeUrl, hackathon
  ]);

  const fetchTeamDetails = async (id: number) => {
    try {
      const res = await api.get(`/hackathon-teams/${id}/`);
      setTeamName(res.data.name);
      setCollege(res.data.college);
      setDepartment(res.data.department);
      setYear(res.data.year);
      setLeaderName(res.data.leader_name);
      setLeaderEmail(res.data.leader_email);
      setLeaderMobile(res.data.leader_mobile);
      setLeaderRollNumber(res.data.leader_roll_number);
      setProblemStatementId(res.data.problem_statement || null);
      setConfirmProblem(!!res.data.problem_statement);
      
      const loadedMembers = res.data.members || [];
      while (loadedMembers.length < 2) {
        loadedMembers.push({ name: '', email: '', phone: '', college: '' });
      }
      setMembers(loadedMembers);

      setGithubUrl(res.data.github_url || '');
      setLinkedinUrl(res.data.linkedin_url || '');
      setResumeUrl(res.data.resume_url || '');
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve existing registration profile.");
    }
  };

  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem(`hackathon_draft_${slug}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setTeamName(parsed.teamName || '');
        setCollege(parsed.college || '');
        setDepartment(parsed.department || '');
        setYear(parsed.year || '1st');
        setLeaderName(parsed.leaderName || '');
        setLeaderEmail(parsed.leaderEmail || '');
        setLeaderMobile(parsed.leaderMobile || '');
        setLeaderRollNumber(parsed.leaderRollNumber || '');
        
        const loadedMembers = parsed.members || [];
        while (loadedMembers.length < 2) {
          loadedMembers.push({ name: '', email: '', phone: '', college: '' });
        }
        setMembers(loadedMembers);

        setGithubUrl(parsed.githubUrl || '');
        setLinkedinUrl(parsed.linkedinUrl || '');
        setResumeUrl(parsed.resumeUrl || '');
      }
    } catch (e) {
      console.error("Failed to restore draft", e);
    }
    setShowDraftPrompt(false);
  };

  const handleClearDraft = () => {
    localStorage.removeItem(`hackathon_draft_${slug}`);
    setShowDraftPrompt(false);
  };

  const addMember = () => {
    if (members.length >= 4) {
      alert("You can add a maximum of 4 co-members (5 members total including Leader).");
      return;
    }
    setMembers([...members, { name: '', email: '', phone: '', college: '' }]);
  };

  const removeMember = (index: number) => {
    if (index < 2) {
      alert("The first 2 co-members (Co-Member #2 and #3) are mandatory and cannot be removed.");
      return;
    }
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof MemberForm, value: string) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  // Validations
  const validateStep = (s: number) => {
    if (s === 1) {
      if (!problemStatementId) return "Please select a problem statement.";
      if (!confirmProblem) return "Please confirm your selected problem statement to continue.";
    }
    if (s === 2) {
      if (!teamName.trim()) return "Team Name is required.";
      if (!college.trim()) return "College Name is required.";
      if (!department.trim()) return "Department is required.";
    }
    if (s === 3) {
      if (!leaderName.trim()) return "Leader Name is required.";
      if (!leaderEmail.trim()) return "Leader Email is required.";
      if (!leaderMobile.trim()) return "Leader Mobile is required.";
      if (!leaderRollNumber.trim()) return "Leader Roll Number is required.";
    }
    if (s === 4) {
      if (members.length < 2) return "At least 2 co-members are required (3 team members minimum including Leader).";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const seenEmails = new Set<string>();
      if (leaderEmail.trim()) {
        seenEmails.add(leaderEmail.trim().toLowerCase());
      }

      // Mandatory Co-Members (#2 & #3)
      for (let i = 0; i < 2; i++) {
        const m = members[i];
        if (!m || !m.name.trim()) return `Co-Member #${i + 2} (Mandatory): Full Name is required.`;
        if (!m.email.trim()) return `Co-Member #${i + 2} (Mandatory): Email Address is required.`;
        if (!emailRegex.test(m.email.trim())) return `Co-Member #${i + 2}: Please enter a valid email address.`;

        const lowerEmail = m.email.trim().toLowerCase();
        if (seenEmails.has(lowerEmail)) {
          return `Co-Member #${i + 2} Email cannot be duplicate of Team Leader or another member.`;
        }
        seenEmails.add(lowerEmail);
      }

      // Optional Co-Members (#4 & #5)
      for (let i = 2; i < members.length; i++) {
        const m = members[i];
        const hasName = !!m.name.trim();
        const hasEmail = !!m.email.trim();

        if (hasName || hasEmail) {
          if (!hasName) return `Co-Member #${i + 2} (Optional): Please provide Full Name or clear this slot.`;
          if (!hasEmail) return `Co-Member #${i + 2} (Optional): Please provide Email Address or clear this slot.`;
          if (!emailRegex.test(m.email.trim())) return `Co-Member #${i + 2}: Please enter a valid email address.`;

          const lowerEmail = m.email.trim().toLowerCase();
          if (seenEmails.has(lowerEmail)) {
            return `Co-Member #${i + 2} Email cannot be duplicate of Team Leader or another member.`;
          }
          seenEmails.add(lowerEmail);
        }
      }
    }
    if (s === 6) {
      if (parseFloat(hackathon?.registration_fee || '0') > 0) {
        if (payMethod === 'card') {
          if (cardNumber.replace(/\s/g, '').length < 16) return "Card number must be 16 digits.";
          if (!cardExpiry || !cardCvv || !cardName.trim()) return "Please complete all credit card fields.";
        } else {
          const cleanUtr = utrNumber.trim();
          if (!cleanUtr || cleanUtr.length !== 12 || !/^\d+$/.test(cleanUtr)) {
            return "Please enter a valid 12-digit UPI UTR Transaction Reference Number.";
          }
        }
      }
    }
    return null;
  };

  const handleNext = () => {
    const validationErr = validateStep(step);
    if (validationErr) {
      setError(validationErr);
      return;
    }
    setError(null);
    
    // Dynamic skipping of payment gateway step for free events
    if (step === 5) {
      if (parseFloat(hackathon?.registration_fee || '0') === 0) {
        setStep(7); // Skip step 6 (Checkout) and go to step 7 (Review Details)
      } else {
        setStep(6);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    
    // Dynamic skipping of payment gateway step for free events
    if (step === 7) {
      if (parseFloat(hackathon?.registration_fee || '0') === 0) {
        setStep(5); // Go back from Step 7 (Review) to Step 5 (Documents)
      } else {
        setStep(6);
      }
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackathon) return;

    setError(null);
    setSubmitting(true);

    try {
      let activeTeamId = teamId;

      // Only create the team if we don't have an existing activeTeamId (e.g. from standalone payment redirects)
      if (!activeTeamId) {
        const teamPayload = {
          hackathon: hackathon.id,
          problem_statement: problemStatementId,
          name: teamName,
          college,
          department,
          year,
          leader_name: leaderName,
          leader_email: leaderEmail,
          leader_mobile: leaderMobile,
          leader_roll_number: leaderRollNumber,
          github_url: githubUrl || null,
          linkedin_url: linkedinUrl || null,
          resume_url: resumeUrl || null,
          members: members
            .filter(m => m.name.trim() && m.email.trim())
            .map((m, idx) => ({
              name: m.name.trim(),
              email: m.email.trim(),
              phone: m.phone?.trim() || `99000${idx}${Math.floor(1000 + Math.random() * 9000)}`,
              college: college
            }))
        };

        const teamRes = await api.post('/hackathon-teams/', teamPayload);
        activeTeamId = teamRes.data.id;
        setTeamId(activeTeamId);
      }

      // Check registration fee
      const fee = parseFloat(hackathon.registration_fee);
      
      const paymentPayload = {
        team_id: activeTeamId,
        payment_method: fee === 0 ? 'card' : payMethod,
        card_number: fee === 0 ? '0000000000000000' : payMethod === 'card' ? cardNumber : null,
        upi_id: fee === 0 ? null : payMethod === 'upi' ? merchantUpiId : null,
        utr_number: fee === 0 ? null : payMethod === 'upi' ? utrNumber.trim() : null
      };

      // Simulated processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const paymentRes = await api.post('/hackathon-payments/process_payment/', paymentPayload);
      setSuccessInfo(paymentRes.data);
      
      // Clear localStorage draft on success
      localStorage.removeItem(`hackathon_draft_${slug}`);
      
      setStep(8);
    } catch (err: any) {
      console.error(err);
      const backendErr = err.response?.data;
      if (backendErr) {
        if (backendErr.error) {
          setError(backendErr.error);
        } else if (backendErr.non_field_errors) {
          setError(backendErr.non_field_errors[0] || backendErr.non_field_errors);
        } else if (backendErr.members) {
          const memErr = backendErr.members;
          if (Array.isArray(memErr)) {
            const messages: string[] = [];
            memErr.forEach((m, idx) => {
              if (m && typeof m === 'object') {
                Object.entries(m).forEach(([field, msgs]) => {
                  const fieldMsgs = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
                  messages.push(`Member #${idx + 2} ${field}: ${fieldMsgs}`);
                });
              } else if (m) {
                messages.push(String(m));
              }
            });
            setError(messages.join(' | ') || "Invalid co-member details.");
          } else if (typeof memErr === 'object') {
            setError(JSON.stringify(memErr));
          } else {
            setError(String(memErr));
          }
        } else {
          const messages: string[] = [];
          Object.entries(backendErr).forEach(([key, val]) => {
            if (Array.isArray(val)) {
              messages.push(`${key}: ${val.flat().join(', ')}`);
            } else if (val && typeof val === 'object') {
              messages.push(`${key}: ${JSON.stringify(val)}`);
            } else {
              messages.push(`${key}: ${val}`);
            }
          });
          setError(messages.join(' | ') || "An error occurred during submission.");
        }
      } else {
        setError("An error occurred during submission. Please verify fields and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyUpiAddress = () => {
    navigator.clipboard.writeText(merchantUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 space-y-3">
        <Loader size={36} className="text-blue-600 animate-spin" />
        <span className="text-xs font-bold">Loading application form...</span>
      </div>
    );
  }

  if (error && !hackathon) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <ShieldAlert className="text-red-500 mx-auto mb-4" size={40} />
        <h3 className="font-bold text-slate-850 dark:text-white">Registration Unresolved</h3>
        <p className="text-xs text-slate-550 mt-2">{error}</p>
        <Link to="/dashboard/hackathons" className="text-blue-600 dark:text-blue-400 mt-4 inline-block hover:underline text-xs font-black uppercase">
          Back to Explore
        </Link>
      </div>
    );
  }

  if (!hackathon) return null;

  const isClosed = hackathon.status === 'closed' || new Date(hackathon.registration_deadline).getTime() < Date.now();

  if (isClosed && step !== 7) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm select-none">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-905 dark:text-white">Registration Closed</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          We are sorry, but registrations for <strong>{hackathon.title}</strong> are now closed because the maximum capacity has been filled or the deadline has passed.
        </p>
        <Link to="/dashboard/hackathons" className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow hover:shadow-md transition-all">
          Browse Other Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 space-y-8 select-none animate-fade-in">
      
      {/* Back Link */}
      <div>
        <Link to={`/dashboard/hackathons/${hackathon.slug}`} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-455 dark:hover:text-slate-200 font-bold group">
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Cancel & Back to Details
        </Link>
      </div>

      {/* Glassmorphic Event Header */}
      <div className="bg-gradient-to-r from-blue-650/10 via-indigo-650/5 to-transparent border border-slate-200 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <span className="px-2.5 py-0.5 text-[9px] font-black uppercase rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/30">
            {hackathon.difficulty}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5 leading-tight">
            {hackathon.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 uppercase font-bold tracking-wider">
            Theme: <span className="text-blue-600 dark:text-blue-400">{hackathon.theme}</span> | Mode: <span className="capitalize">{hackathon.mode}</span>
          </p>
        </div>
        <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 p-4 rounded-2xl text-left md:text-right flex items-center md:items-start gap-3 shrink-0 shadow-sm">
          <div className="text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-xl">
            <Trophy size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Entrance Fee</span>
            <span className="text-base font-black text-slate-850 dark:text-slate-250">
              {parseFloat(hackathon.registration_fee) > 0 ? `₹${Math.round(parseFloat(hackathon.registration_fee))}` : 'Free Entrance'}
            </span>
          </div>
        </div>
      </div>

      {/* Auto-Save Draft Prompt Banner */}
      {showDraftPrompt && (
        <div className="bg-blue-500/10 text-blue-650 dark:bg-blue-950/30 dark:text-blue-400 p-4 rounded-2xl border border-blue-500/15 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-slide-in">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="shrink-0 text-blue-500" />
            <span className="font-semibold text-center sm:text-left leading-relaxed">
              We found a previously saved draft for your registration details. Would you like to restore it?
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRestoreDraft}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
            >
              Restore Draft
            </button>
            <button
              onClick={handleClearDraft}
              className="px-3 py-1.5 border border-blue-500/20 dark:border-blue-800 hover:bg-blue-500/5 text-slate-650 dark:text-blue-350 rounded-xl font-bold transition-all cursor-pointer"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Multi-Step Stepper Progress Bar */}
      {step < 8 && (
        <div className="overflow-x-auto pb-2 select-none scrollbar-none">
          <div className="flex items-center justify-between min-w-[800px] px-2 relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-slate-100 dark:bg-slate-850 -z-10"></div>
            {[
              { id: 1, label: 'Problem Selection' },
              { id: 2, label: 'Team Profile' },
              { id: 3, label: 'Leader Info' },
              { id: 4, label: 'Members' },
              { id: 5, label: 'Documents' },
              ...(parseFloat(hackathon.registration_fee || '0') > 0 ? [{ id: 6, label: 'Secure Checkout' }] : []),
              { id: 7, label: 'Review Details' }
            ].map((s, idx) => {
              const active = step === s.id;
              const passed = step > s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-black shadow-sm transition-all bg-white dark:bg-[#090b11] ${
                    active ? 'border-blue-600 text-blue-600 scale-105 scale-110 shadow-md shadow-blue-500/10' : 
                    passed ? 'border-emerald-500 bg-emerald-500 text-white' :
                    'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}>
                    {passed ? <CheckCircle size={14} className="text-white fill-emerald-500" /> : (idx + 1)}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    active ? 'text-blue-600' : passed ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Alert Display */}
      {error && (
        <div className="p-4 bg-red-500/10 text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-500/25 rounded-2xl flex items-start gap-2.5 text-xs animate-shake">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span className="leading-relaxed font-semibold">{error}</span>
        </div>
      )}

      {/* Wizard Form Layout Box */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden min-h-[300px]">
        
        {submitting && (
          <div className="absolute inset-0 bg-white/70 dark:bg-[#090b11]/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2 select-none animate-fade-in">
            <Loader size={36} className="text-blue-600 animate-spin" />
            <span className="text-xs font-black text-slate-850 dark:text-slate-200">Submitting your registration details...</span>
          </div>
        )}

        {/* STEP 1: CHOOSE PROBLEM STATEMENT */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                <Layers size={16} className="text-blue-600" /> Choose Your Problem Statement
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                Select one of the official problem statement challenges. You can view full details for each before selecting.
              </p>
            </div>

            {problemStatements.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                <Layers size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-500">Problem statements will be announced soon.</p>
                <p className="text-xs text-slate-400">Please check back later or contact the hackathon administrator.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {problemStatements.map((ps, idx) => {
                    const isSelected = problemStatementId === ps.id;
                    return (
                      <div
                        key={ps.id}
                        onClick={() => {
                          setProblemStatementId(ps.id);
                          setSelectedProblem(ps);
                          setConfirmProblem(false);
                        }}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/10 dark:bg-blue-950/15 shadow-md shadow-blue-500/5'
                            : 'border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50/50 dark:bg-slate-900 hover:border-slate-350 hover:shadow-sm'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl flex items-center gap-1">
                            <CheckCircle size={10} /> Selected Choice
                          </div>
                        )}
                        
                        <div className="space-y-2 pr-12">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-[10px] flex items-center justify-center shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{ps.title}</h4>
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full border ${
                              ps.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' :
                              ps.difficulty === 'hard' ? 'bg-red-50 text-red-705 border-red-200 dark:bg-red-950/20 dark:text-red-400' :
                              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/20 dark:text-amber-400'
                            }`}>{ps.difficulty}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                            {ps.short_description || ps.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingProblem(ps);
                            }}
                            className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            View Full Problem Details →
                          </button>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProblemStatementId(ps.id);
                              setSelectedProblem(ps);
                              setConfirmProblem(true);
                            }}
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm Chosen Problem Area */}
                {problemStatementId && selectedProblem && (
                  <div className="p-5 bg-blue-50/10 dark:bg-blue-950/5 border border-blue-500/20 dark:border-blue-800/40 rounded-2xl animate-slide-in space-y-3">
                    <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Your Selected Problem</span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">{selectedProblem.title}</h4>
                    <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                      <button
                        type="button"
                        onClick={() => setConfirmProblem(true)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          confirmProblem
                            ? 'bg-emerald-600 text-white shadow shadow-emerald-500/10'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow shadow-blue-500/10'
                        }`}
                      >
                        {confirmProblem ? <><CheckCircle size={12} /> Confirmed</> : 'Confirm & Continue →'}
                      </button>
                      
                      {confirmProblem && (
                        <button
                          type="button"
                          onClick={() => setConfirmProblem(false)}
                          className="px-3 py-2 border border-slate-200 dark:border-slate-800 text-slate-505 dark:text-slate-405 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                        >
                          Change Choice
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Detailed Problem Statement Modal */}
            {viewingProblem && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">Full Specifications</span>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{viewingProblem.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingProblem(null)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {[
                      { label: "Description Overview", val: viewingProblem.description },
                      { label: "Background", val: viewingProblem.background },
                      { label: "Objective", val: viewingProblem.objective },
                      { label: "Requirements", val: viewingProblem.requirements },
                      { label: "Expected Solution", val: viewingProblem.expected_solution },
                      { label: "Constraints", val: viewingProblem.constraints },
                      { label: "Technology Preferences", val: viewingProblem.technology_preferences },
                      { label: "Deliverables", val: viewingProblem.deliverables },
                      { label: "Evaluation Criteria", val: viewingProblem.evaluation_criteria },
                      { label: "Additional Instructions", val: viewingProblem.additional_instructions },
                    ].filter(s => s.val).map((sect, i) => (
                      <div key={i} className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-wide block">{sect.label}</span>
                        <p className="whitespace-pre-wrap bg-slate-50 dark:bg-slate-950/40 p-3.5 border border-slate-100 dark:border-slate-850 rounded-xl leading-relaxed font-semibold">
                          {sect.val}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={() => {
                        setProblemStatementId(viewingProblem.id);
                        setSelectedProblem(viewingProblem);
                        setConfirmProblem(true);
                        setViewingProblem(null);
                      }}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
                    >
                      Select & Confirm This Problem
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: TEAM PROFILE */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-600" /> Academic & Team Info
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">Enter your primary campus academic profile and choose a team registration name.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Team Name *</label>
                <input 
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Choose a creative team name"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-550 dark:text-slate-455 block mb-1">College Name *</label>
                <input 
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. IIT Kharagpur"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-550 dark:text-slate-455 block mb-1">Department *</label>
                <input 
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science Engineering"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-550 dark:text-slate-455 block mb-1">Year of Study *</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LEADER PROFILE */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                <User size={16} className="text-blue-600" /> Team Leader Contact Info
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">Your contact profile will represent the team. Registration code and updates will be routed here.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-slate-550 block mb-1">Leader Full Name *</label>
                <input 
                  type="text"
                  required
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-808 dark:text-slate-202 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-550 block mb-1">Leader Email *</label>
                <input 
                  type="email"
                  required
                  disabled
                  value={leaderEmail}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-555 block mb-1">Leader Mobile *</label>
                <input 
                  type="text"
                  required
                  value={leaderMobile}
                  onChange={(e) => setLeaderMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-808 dark:text-slate-202 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-555 block mb-1">Roll Number / Student ID *</label>
                <input 
                  type="text"
                  required
                  value={leaderRollNumber}
                  onChange={(e) => setLeaderRollNumber(e.target.value)}
                  placeholder="e.g. CS2023055"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-808 dark:text-slate-202 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: MEMBERS DETAIL */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-2">
                    <User size={16} className="text-blue-600" /> Co-Members Directory
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/40">
                    2 Mandatory * + 2 Optional
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">
                  Add details of additional team members. <strong>2 co-members are mandatory (*)</strong> (minimum 3 members total including Leader). You can optionally add up to 2 additional co-members (maximum 4 co-members / 5 members total).
                </p>
              </div>
              {members.length < 4 && (
                <button
                  type="button"
                  onClick={addMember}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={14} /> Add Co-Member
                </button>
              )}
            </div>

            <div className="space-y-4">
              {members.map((member, idx) => {
                const isMandatory = idx < 2;
                return (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-2xl relative space-y-4 shadow-sm animate-slide-in border transition-all ${
                      isMandatory 
                        ? 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800' 
                        : 'bg-white dark:bg-slate-900/60 border-dashed border-blue-300/80 dark:border-blue-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Co-Member #{idx + 2}
                        </span>
                        {isMandatory ? (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/50">
                            Mandatory *
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            Optional
                          </span>
                        )}
                      </div>
                      
                      {!isMandatory && (
                        <button
                          type="button"
                          onClick={() => removeMember(idx)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Remove optional member"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-550 block mb-1">
                          Full Name {isMandatory ? '*' : '(Optional)'}
                        </label>
                        <input 
                          type="text"
                          required={isMandatory}
                          value={member.name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          placeholder={isMandatory ? "e.g. Jane Doe" : "e.g. Jane Doe (Leave blank to skip)"}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-250 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-808 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-550 block mb-1">
                          Email Address {isMandatory ? '*' : '(Optional)'}
                        </label>
                        <input 
                          type="email"
                          required={isMandatory}
                          value={member.email}
                          onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                          placeholder={isMandatory ? "e.g. jane.doe@college.edu" : "e.g. jane.doe@college.edu"}
                          className="w-full px-3.5 py-2.5 text-xs border border-slate-250 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-808 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {members.length < 4 && (
                <button
                  type="button"
                  onClick={addMember}
                  className="w-full py-3.5 border-2 border-dashed border-blue-300/80 hover:border-blue-500 dark:border-blue-900/60 dark:hover:border-blue-700 bg-blue-50/20 hover:bg-blue-50/50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 rounded-2xl text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  Add Optional Co-Member ({members.length}/4 Co-Members)
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: DOCUMENTS/SOCIALS */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" /> Project Socials & Documents
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">Help our judges understand your team's skillset. You can link your portfolio and resumes.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-550 block mb-1">Team Leader GitHub Profile URL</label>
                <input 
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-808 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-555 block mb-1">Team Leader LinkedIn Profile URL</label>
                <input 
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-808 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-555 block mb-1">Team Leader Resume Document URL</label>
                <input 
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="Google Drive or Dropbox shareable PDF link"
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-955 text-slate-808 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: SECURE PAYMENT GATEWAY */}
        {step === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600" /> Registration Fee Checkout
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">Make a secure payment of entrance charges to confirm your slot allocation.</p>
            </div>

            {/* Bill Summary */}
            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-750 text-white rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Checkout Bill Summary</span>
                  <h4 className="text-lg font-black mt-0.5">{teamName || 'Your Registered Team'}</h4>
                  <p className="text-[10px] text-blue-100 mt-0.5">Leader: {leaderName} ({leaderEmail})</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-black tracking-wider border border-white/20">INR BILL</span>
              </div>
              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <span className="text-xs text-blue-100 font-medium">Entrance Registration Charge</span>
                <span className="text-3xl font-black">₹{Math.round(parseFloat(hackathon.registration_fee))}</span>
              </div>
            </div>

            {/* Secure UPI Checkout */}
            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Secure UPI Gateway</span>
              
              <div className="space-y-5 animate-fade-in border border-slate-200/50 dark:border-slate-850 p-6 rounded-3xl bg-slate-50/20 dark:bg-slate-955/10">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Dynamic Real Scannable QR Code */}
                  <div className="bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-md flex items-center justify-center shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                        `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${Math.round(parseFloat(hackathon.registration_fee))}&cu=INR`
                      )}`} 
                      alt="UPI Scan to Pay QR Code" 
                      className="w-56 h-56 sm:w-60 sm:h-60 select-none rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h4 className="text-sm font-black text-slate-850 dark:text-white flex items-center justify-center gap-1.5">
                      <QrCode size={16} className="text-blue-600 animate-pulse" /> Scan QR to Pay
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      Open Google Pay, PhonePe, Paytm, or any banking app to scan the code. The registration fee of <span className="text-blue-600 dark:text-blue-400 font-bold">₹{Math.round(parseFloat(hackathon.registration_fee))}</span> will auto-fill.
                    </p>
                    
                    <div className="flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-2xl w-max mx-auto shadow-sm">
                      <span className="text-[11px] font-mono font-black text-slate-700 dark:text-slate-350 px-1 select-all">{merchantUpiId}</span>
                      <button
                        type="button"
                        onClick={copyUpiAddress}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-5">
                  <label className="text-[10px] font-bold text-slate-550 block mb-1">Enter 12-digit UPI Transaction Reference / UTR Number *</label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 345678901234"
                    maxLength={12}
                    className="w-full px-4 py-2.5 text-xs border border-slate-205 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-808 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[9px] text-slate-400 italic">Please do not submit a dummy UTR; transactions will be cross-verified by the administrator.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: APPLICATION SUMMARY REVIEW */}
        {step === 7 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-600" /> Review Application Details
              </h3>
              <p className="text-[11px] text-slate-455 mt-1 font-semibold">Review your submitted parameters before dispatching final registrations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-655 dark:text-slate-350">
              
              {/* Box: Selected Problem Statement */}
              <div className="p-5 bg-blue-50/10 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40 rounded-2xl space-y-2 shadow-sm md:col-span-2">
                <h4 className="font-black text-blue-800 dark:text-blue-400 border-b border-blue-150/40 dark:border-blue-850 pb-1 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Layers size={12} /> Selected Problem Statement
                </h4>
                <p><span className="text-slate-455 font-bold">Title:</span> <span className="font-extrabold text-slate-900 dark:text-white">{selectedProblem?.title || 'None Selected'}</span></p>
                <p><span className="text-slate-455">Difficulty:</span> <span className="capitalize">{selectedProblem?.difficulty || 'medium'}</span></p>
              </div>

              {/* Box 1: Team profile */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2 shadow-sm">
                <h4 className="font-black text-slate-850 dark:text-white border-b border-slate-150/40 dark:border-slate-850 pb-1 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <BookOpen size={12} className="text-blue-500" /> Team & Academic Info
                </h4>
                <p><span className="text-slate-455 font-bold">Team Name:</span> <span className="font-extrabold text-slate-900 dark:text-white">{teamName}</span></p>
                <p><span className="text-slate-455">College:</span> {college}</p>
                <p><span className="text-slate-455">Department:</span> {department}</p>
                <p><span className="text-slate-455">Academic Year:</span> {year} Year</p>
              </div>

              {/* Box 2: Leader profile */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2 shadow-sm">
                <h4 className="font-black text-slate-850 dark:text-white border-b border-slate-150/40 dark:border-slate-850 pb-1 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <User size={12} className="text-blue-500" /> Team Leader
                </h4>
                <p><span className="text-slate-455 font-bold">Name:</span> {leaderName}</p>
                <p><span className="text-slate-455">Email:</span> {leaderEmail}</p>
                <p><span className="text-slate-455">Mobile:</span> {leaderMobile}</p>
                <p><span className="text-slate-455">Student ID:</span> {leaderRollNumber}</p>
              </div>

              {/* Box 3: Co-members */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2 shadow-sm md:col-span-2">
                <h4 className="font-black text-slate-850 dark:text-white border-b border-slate-150/40 dark:border-slate-850 pb-1 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Users size={12} className="text-blue-500" /> Registered Co-Members ({members.filter(m => m.name.trim() && m.email.trim()).length})
                </h4>
                {members.filter(m => m.name.trim() && m.email.trim()).length === 0 ? (
                  <p className="italic text-slate-455">No additional team members added.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {members
                      .filter(m => m.name.trim() && m.email.trim())
                      .map((m, i) => (
                        <div key={i} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-[11px]">#{i+2}: {m.name}</span>
                            <span className="text-[10px] text-slate-455 block mt-0.5">{m.email}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            i < 2 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/40' 
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {i < 2 ? 'Mandatory' : 'Optional'}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Box 4: Docs & Checkout config */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2 shadow-sm md:col-span-2">
                <h4 className="font-black text-slate-850 dark:text-white border-b border-slate-150/40 dark:border-slate-850 pb-1 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <FileText size={12} className="text-blue-500" /> Documents & Checkout Gateway
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p><span className="text-slate-455">GitHub:</span> {githubUrl ? <a href={githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{githubUrl}</a> : 'Not provided'}</p>
                    <p><span className="text-slate-455">LinkedIn:</span> {linkedinUrl ? <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{linkedinUrl}</a> : 'Not provided'}</p>
                    <p><span className="text-slate-455">Resume:</span> {resumeUrl ? <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Document</a> : 'Not provided'}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-450 block uppercase tracking-widest font-black">Selected Gateway</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white capitalize flex items-center gap-1 mt-0.5">
                        {parseFloat(hackathon.registration_fee) === 0 ? 'Free Entry' : payMethod === 'card' ? <><CreditCard size={12} /> Card Payment</> : <><QrCode size={12} /> UPI ({utrNumber})</>}
                      </span>
                    </div>
                    <span className="text-base font-black text-slate-900 dark:text-white">₹{Math.round(parseFloat(hackathon.registration_fee))}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Terms checkbox */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex items-start gap-2.5 text-xs text-slate-655 dark:text-slate-400 select-none">
              <input
                type="checkbox"
                id="final-agree"
                required
                className="mt-0.5 shrink-0 cursor-pointer w-4 h-4 rounded text-blue-600 border-slate-300"
              />
              <label htmlFor="final-agree" className="leading-relaxed cursor-pointer font-semibold">
                I verify that all entered profiles are accurate and belong to the respective individuals. I agree to the code-of-conduct guidelines. Click Submit to finalize.
              </label>
            </div>
          </div>
        )}

        {/* STEP 8: SUCCESS COMPLETION */}
        {step === 8 && successInfo && (
          <div className="text-center py-12 space-y-6 animate-fade-in select-none max-w-md mx-auto">
            
            {/* success tick bouncing */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 flex items-center justify-center mx-auto shadow-sm scale-110 animate-bounce">
              <CheckCircle size={36} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {successInfo.status === 'pending' ? 'UTR Registration Logged!' : 'Registration Confirmed! 🎉'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {successInfo.status === 'pending'
                  ? `Your reference payment of ₹${successInfo.amount} has been logged in pending status. Our administrators will review the UTR reference code and notify you.`
                  : `Your application profile under team '${teamName}' has been successfully completed. An authorization email has been dispatched to all team members.`}
              </p>
            </div>

            {/* receipt metadata */}
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 text-left text-xs font-semibold text-slate-650 dark:text-slate-350 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-455">Team Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">Selected Problem</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{selectedProblem?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">Registration ID</span>
                <span className="font-bold text-slate-900 dark:text-white">{successInfo.registration_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">Invoice Code</span>
                <span className="font-bold text-slate-900 dark:text-white">{successInfo.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-455">UTR / Transaction ID</span>
                <span className="font-bold text-mono text-[10px] text-slate-900 dark:text-white">{successInfo.payment_id}</span>
              </div>
              <div className="flex justify-between border-t border-slate-150 dark:border-slate-850 pt-2.5">
                <span className="text-slate-455">Approval Status</span>
                <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded ${
                  successInfo.status === 'success' 
                    ? 'bg-emerald-100 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-500/10' 
                    : 'bg-amber-100 text-amber-650 dark:bg-amber-955/20 dark:text-amber-450 border border-amber-500/10'
                }`}>
                  {successInfo.status}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={`/dashboard/hackathons/${hackathon.slug}`}
                className="w-full py-3 bg-blue-650 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all text-center block"
              >
                Go to My Hackathon
              </Link>
            </div>
          </div>
        )}

        {/* Form Footer Buttons (Sticky Actions Layout inside card) */}
        {step < 8 && (
          <div className="border-t border-slate-100 dark:border-slate-850 pt-6 mt-8 flex justify-between items-center gap-3 bg-white dark:bg-slate-900">
            {step === 1 ? (
              <Link
                to={`/dashboard/hackathons/${hackathon.slug}`}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-955 transition-colors"
              >
                Cancel
              </Link>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleBack}
                className="px-4 py-2.5 border border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-450 text-xs font-black rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Previous
              </button>
            )}

            {step < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {step === 6 && parseFloat(hackathon.registration_fee) === 0 ? 'Skip to Review' : 'Next Step'} <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {submitting ? 'Processing Submission...' : 'Submit Application'} <CheckCircle size={14} />
              </button>
            )}
          </div>
        )}

      </form>

    </div>
  );
};

// Internal icon helper to prevent multiple named imports issues
const Users = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`lucide lucide-users ${className}`}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default HackathonRegister;
