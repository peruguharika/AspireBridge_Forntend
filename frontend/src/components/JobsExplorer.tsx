import { useState } from 'react';
import { ArrowLeft, Search, Bell, Bookmark, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface JobNotification {
  id: string;
  title: string;
  organization: string;
  description: string;
  totalPosts: string;
  qualification: string;
  ageLimit: string;
  salary: string;
  status: 'new' | 'active' | 'closed';
  category: string;
  type: string;
  applicationDeadline?: string;
  examDate?: string;
  notificationUrl?: string;
  exams?: string[];
}

const jobNotifications: JobNotification[] = [
  // UPSC Notifications
  {
    id: '1',
    title: 'UPSC Civil Services Examination 2024',
    organization: 'Union Public Service Commission',
    description: 'The Civil Services Examination for recruitment to various civil services positions.',
    totalPosts: '1000+',
    qualification: 'Graduation',
    ageLimit: '21-32 years',
    salary: '₹56,100 - ₹2,50,000',
    status: 'closed',
    category: 'UPSC',
    type: 'All',
    applicationDeadline: '28 Feb 2024',
    examDate: 'May 2024',
    notificationUrl: 'https://upsc.gov.in',
    exams: ['UPSC CSE Prelims', 'UPSC CSE Mains', 'UPSC Interview']
  },
  {
    id: '2',
    title: 'UPSC Engineering Services Examination (ESE) 2025',
    organization: 'Union Public Service Commission',
    description: 'Recruitment to Group A Engineering Services under Government of India.',
    totalPosts: '300+',
    qualification: 'B.E/B.Tech',
    ageLimit: '21-30 years',
    salary: '₹56,100 - ₹1,77,500',
    status: 'new',
    category: 'UPSC',
    type: 'All',
    applicationDeadline: '15 Jan 2025',
    examDate: 'June 2025',
    notificationUrl: 'https://upsc.gov.in',
    exams: ['ESE Prelims', 'ESE Mains', 'ESE Interview']
  },
  {
    id: '3',
    title: 'UPSC Combined Defence Services (CDS) Examination',
    organization: 'Union Public Service Commission',
    description: 'For admission to Indian Military Academy, Naval Academy, Air Force Academy.',
    totalPosts: '400+',
    qualification: 'Graduation',
    ageLimit: '19-25 years',
    salary: '₹56,100 - ₹1,77,500',
    status: 'active',
    category: 'UPSC',
    type: 'All',
    applicationDeadline: '20 Jan 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://upsc.gov.in',
    exams: ['CDS Written Exam', 'SSB Interview']
  },
  {
    id: '4',
    title: 'UPSC National Defence Academy (NDA) Examination',
    organization: 'Union Public Service Commission',
    description: 'For admission to Army, Navy and Air Force wings of NDA.',
    totalPosts: '400+',
    qualification: '12th Pass',
    ageLimit: '16.5-19.5 years',
    salary: '₹15,600 - ₹39,100',
    status: 'active',
    category: 'UPSC',
    type: 'All',
    applicationDeadline: '10 Feb 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://upsc.gov.in',
    exams: ['NDA Written Exam', 'SSB Interview']
  },
  {
    id: '5',
    title: 'UPSC Indian Forest Service (IFS) Examination 2024',
    organization: 'Union Public Service Commission',
    description: 'For recruitment to Indian Forest Service (Main) Examination.',
    totalPosts: '150+',
    qualification: 'Graduation with Science',
    ageLimit: '21-32 years',
    salary: '₹56,100 - ₹2,25,000',
    status: 'closed',
    category: 'UPSC',
    type: 'All',
    applicationDeadline: '1 Mar 2024',
    examDate: 'Dec 2024',
    notificationUrl: 'https://upsc.gov.in',
    exams: ['IFS Prelims', 'IFS Mains', 'IFS Interview']
  },

  // SSC Notifications
  {
    id: '6',
    title: 'SSC Combined Graduate Level (CGL) Examination 2024',
    organization: 'Staff Selection Commission',
    description: 'For recruitment to various Group B and Group C posts in Government Ministries.',
    totalPosts: '17000+',
    qualification: 'Graduation',
    ageLimit: '18-32 years',
    salary: '₹25,500 - ₹1,42,400',
    status: 'new',
    category: 'SSC',
    type: 'All',
    applicationDeadline: '24 Jan 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://ssc.gov.in',
    exams: ['SSC CGL Tier-I', 'SSC CGL Tier-II', 'SSC CGL Tier-III']
  },
  {
    id: '7',
    title: 'SSC Combined Higher Secondary Level (CHSL) 2024',
    organization: 'Staff Selection Commission',
    description: 'For recruitment to LDC, JSA, DEO, PA and SA posts.',
    totalPosts: '3500+',
    qualification: '12th Pass',
    ageLimit: '18-27 years',
    salary: '₹19,900 - ₹81,100',
    status: 'active',
    category: 'SSC',
    type: 'All',
    applicationDeadline: '30 Jan 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://ssc.gov.in',
    exams: ['SSC CHSL Tier-I', 'SSC CHSL Tier-II']
  },
  {
    id: '8',
    title: 'SSC Junior Engineer (JE) Examination 2024',
    organization: 'Staff Selection Commission',
    description: 'For recruitment of Junior Engineers (Civil, Electrical, Mechanical, Quantity Surveying).',
    totalPosts: '900+',
    qualification: 'Diploma/B.Tech',
    ageLimit: '18-32 years',
    salary: '₹35,400 - ₹1,12,400',
    status: 'active',
    category: 'SSC',
    type: 'All',
    applicationDeadline: '5 Feb 2025',
    examDate: 'June 2025',
    notificationUrl: 'https://ssc.gov.in',
    exams: ['SSC JE Paper-I', 'SSC JE Paper-II']
  },
  {
    id: '9',
    title: 'SSC Multi Tasking Staff (MTS) Examination 2024',
    organization: 'Staff Selection Commission',
    description: 'For recruitment to Multi Tasking Staff and Havaldar posts.',
    totalPosts: '8000+',
    qualification: '10th Pass',
    ageLimit: '18-25 years',
    salary: '₹18,000 - ₹56,900',
    status: 'active',
    category: 'SSC',
    type: 'All',
    applicationDeadline: '15 Feb 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://ssc.gov.in',
    exams: ['SSC MTS Paper-I', 'SSC MTS Paper-II']
  },
  {
    id: '10',
    title: 'SSC Selection Post Phase XII 2024',
    organization: 'Staff Selection Commission',
    description: 'For recruitment to various posts in different categories across Ministries/Departments.',
    totalPosts: '5000+',
    qualification: '10th/12th/Graduation',
    ageLimit: '18-30 years',
    salary: '₹18,000 - ₹81,100',
    status: 'new',
    category: 'SSC',
    type: 'All',
    applicationDeadline: '25 Jan 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://ssc.gov.in',
    exams: ['SSC Selection Post CBT']
  },

  // Banking Notifications
  {
    id: '11',
    title: 'SBI Clerk Recruitment 2024',
    organization: 'State Bank of India',
    description: 'For recruitment of Junior Associates (Customer Support & Sales) in Clerical Cadre.',
    totalPosts: '8000+',
    qualification: 'Graduation',
    ageLimit: '20-28 years',
    salary: '₹17,900 - ₹47,920',
    status: 'active',
    category: 'Banking',
    type: 'All',
    applicationDeadline: '18 Jan 2025',
    examDate: 'March 2025',
    notificationUrl: 'https://sbi.co.in/careers',
    exams: ['SBI Clerk Prelims', 'SBI Clerk Mains']
  },
  {
    id: '12',
    title: 'IBPS PO Recruitment 2024',
    organization: 'Institute of Banking Personnel Selection',
    description: 'For recruitment of Probationary Officers in participating banks.',
    totalPosts: '4000+',
    qualification: 'Graduation',
    ageLimit: '20-30 years',
    salary: '₹23,700 - ₹42,020',
    status: 'new',
    category: 'Banking',
    type: 'All',
    applicationDeadline: '22 Jan 2025',
    examDate: 'September 2025',
    notificationUrl: 'https://ibps.in',
    exams: ['IBPS PO Prelims', 'IBPS PO Mains', 'IBPS PO Interview']
  },
  {
    id: '13',
    title: 'RBI Grade B Officer Recruitment 2024',
    organization: 'Reserve Bank of India',
    description: 'For Direct Recruitment for Grade B (DR) - (General) Officers.',
    totalPosts: '294',
    qualification: 'Graduation',
    ageLimit: '21-30 years',
    salary: '₹67,000 - ₹77,000',
    status: 'active',
    category: 'Banking',
    type: 'All',
    applicationDeadline: '12 Feb 2025',
    examDate: 'June 2025',
    notificationUrl: 'https://rbi.org.in',
    exams: ['RBI Grade B Phase-I', 'RBI Grade B Phase-II', 'RBI Grade B Interview']
  },
  {
    id: '14',
    title: 'IBPS Clerk Recruitment 2024',
    organization: 'Institute of Banking Personnel Selection',
    description: 'CRP for Clerks in participating banks.',
    totalPosts: '6000+',
    qualification: 'Graduation',
    ageLimit: '20-28 years',
    salary: '₹11,765 - ₹31,540',
    status: 'active',
    category: 'Banking',
    type: 'All',
    applicationDeadline: '8 Feb 2025',
    examDate: 'August 2025',
    notificationUrl: 'https://ibps.in',
    exams: ['IBPS Clerk Prelims', 'IBPS Clerk Mains']
  },
  {
    id: '15',
    title: 'NABARD Grade A Officer Recruitment 2024',
    organization: 'National Bank for Agriculture and Rural Development',
    description: 'For recruitment to the post of Assistant Managers (Grade A).',
    totalPosts: '150+',
    qualification: 'Graduation',
    ageLimit: '21-30 years',
    salary: '₹42,000 - ₹70,000',
    status: 'new',
    category: 'Banking',
    type: 'All',
    applicationDeadline: '20 Jan 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://nabard.org',
    exams: ['NABARD Grade A Prelims', 'NABARD Grade A Mains', 'NABARD Interview']
  },

  // Railway Notifications
  {
    id: '16',
    title: 'RRB NTPC (Non-Technical Popular Categories) 2024',
    organization: 'Railway Recruitment Board',
    description: 'For recruitment to various Non-Technical Popular Categories posts.',
    totalPosts: '11000+',
    qualification: 'Graduation/12th',
    ageLimit: '18-33 years',
    salary: '₹21,700 - ₹69,100',
    status: 'active',
    category: 'Railways',
    type: 'All',
    applicationDeadline: '28 Jan 2025',
    examDate: 'March 2025',
    notificationUrl: 'https://rrbcdg.gov.in',
    exams: ['RRB NTPC CBT-1', 'RRB NTPC CBT-2', 'RRB NTPC Typing Test']
  },
  {
    id: '17',
    title: 'RRB Group D Recruitment 2024',
    organization: 'Railway Recruitment Board',
    description: 'For recruitment to Level 1 posts in Indian Railways.',
    totalPosts: '62000+',
    qualification: '10th Pass',
    ageLimit: '18-33 years',
    salary: '₹18,000 - ₹56,900',
    status: 'new',
    category: 'Railways',
    type: 'All',
    applicationDeadline: '2 Feb 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://rrbcdg.gov.in',
    exams: ['RRB Group D CBT', 'RRB Group D PET', 'RRB Group D Medical']
  },
  {
    id: '18',
    title: 'RRB ALP (Assistant Loco Pilot) Recruitment 2024',
    organization: 'Railway Recruitment Board',
    description: 'For recruitment of Assistant Loco Pilots and Technicians.',
    totalPosts: '5000+',
    qualification: 'ITI/Diploma',
    ageLimit: '18-30 years',
    salary: '₹21,700 - ₹69,100',
    status: 'active',
    category: 'Railways',
    type: 'All',
    applicationDeadline: '25 Jan 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://rrbcdg.gov.in',
    exams: ['RRB ALP CBT-1', 'RRB ALP CBT-2', 'RRB ALP CBAT']
  },
  {
    id: '19',
    title: 'RRB JE (Junior Engineer) Recruitment 2024',
    organization: 'Railway Recruitment Board',
    description: 'For recruitment of Junior Engineers, DMS and CMA posts.',
    totalPosts: '1200+',
    qualification: 'Diploma/B.Tech',
    ageLimit: '18-36 years',
    salary: '₹35,400 - ₹1,12,400',
    status: 'active',
    category: 'Railways',
    type: 'All',
    applicationDeadline: '15 Feb 2025',
    examDate: 'June 2025',
    notificationUrl: 'https://rrbcdg.gov.in',
    exams: ['RRB JE CBT-1', 'RRB JE CBT-2']
  },
  {
    id: '20',
    title: 'Railway Paramedical Staff Recruitment 2024',
    organization: 'Railway Recruitment Board',
    description: 'For recruitment to Paramedical Categories posts.',
    totalPosts: '500+',
    qualification: '12th + Diploma',
    ageLimit: '18-33 years',
    salary: '₹21,700 - ₹69,100',
    status: 'new',
    category: 'Railways',
    type: 'All',
    applicationDeadline: '30 Jan 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://rrbcdg.gov.in',
    exams: ['RRB Paramedical CBT', 'RRB Paramedical Skill Test']
  },

  // State PSC Notifications
  {
    id: '21',
    title: 'UPPSC PCS (Provincial Civil Services) 2024',
    organization: 'Uttar Pradesh Public Service Commission',
    description: 'For recruitment to various posts in UP Civil Services and Allied Services.',
    totalPosts: '400+',
    qualification: 'Graduation',
    ageLimit: '21-40 years',
    salary: '₹40,000 - ₹1,40,000',
    status: 'active',
    category: 'State PSC',
    type: 'All',
    applicationDeadline: '10 Feb 2025',
    examDate: 'June 2025',
    notificationUrl: 'https://uppsc.up.nic.in',
    exams: ['UPPSC PCS Prelims', 'UPPSC PCS Mains', 'UPPSC Interview']
  },
  {
    id: '22',
    title: 'BPSC Combined Competitive Examination 2024',
    organization: 'Bihar Public Service Commission',
    description: 'For recruitment to various administrative posts in Bihar State Services.',
    totalPosts: '800+',
    qualification: 'Graduation',
    ageLimit: '20-37 years',
    salary: '₹35,000 - ₹1,25,000',
    status: 'new',
    category: 'State PSC',
    type: 'All',
    applicationDeadline: '5 Feb 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://bpsc.bih.nic.in',
    exams: ['BPSC Prelims', 'BPSC Mains', 'BPSC Interview']
  },
  {
    id: '23',
    title: 'MPPSC State Service Examination 2024',
    organization: 'Madhya Pradesh Public Service Commission',
    description: 'For recruitment to State Service and Allied Services posts.',
    totalPosts: '250+',
    qualification: 'Graduation',
    ageLimit: '21-40 years',
    salary: '₹38,000 - ₹1,30,000',
    status: 'active',
    category: 'State PSC',
    type: 'All',
    applicationDeadline: '20 Jan 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://mppsc.mp.gov.in',
    exams: ['MPPSC Prelims', 'MPPSC Mains', 'MPPSC Interview']
  },
  {
    id: '24',
    title: 'RPSC RAS (Rajasthan Administrative Service) 2024',
    organization: 'Rajasthan Public Service Commission',
    description: 'For recruitment to RAS and Allied Services posts.',
    totalPosts: '800+',
    qualification: 'Graduation',
    ageLimit: '21-40 years',
    salary: '₹37,000 - ₹1,28,000',
    status: 'active',
    category: 'State PSC',
    type: 'All',
    applicationDeadline: '28 Jan 2025',
    examDate: 'June 2025',
    notificationUrl: 'https://rpsc.rajasthan.gov.in',
    exams: ['RPSC RAS Prelims', 'RPSC RAS Mains', 'RPSC Interview']
  },
  {
    id: '25',
    title: 'GPSC Class 1 & Class 2 Services Examination 2024',
    organization: 'Gujarat Public Service Commission',
    description: 'For recruitment to Class 1 and Class 2 services in Gujarat State.',
    totalPosts: '200+',
    qualification: 'Graduation',
    ageLimit: '21-35 years',
    salary: '₹42,000 - ₹1,35,000',
    status: 'new',
    category: 'State PSC',
    type: 'All',
    applicationDeadline: '15 Jan 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://gpsc.gujarat.gov.in',
    exams: ['GPSC Prelims', 'GPSC Mains', 'GPSC Interview']
  },

  // State Government Jobs
  {
    id: '26',
    title: 'UP Police Constable Recruitment 2024',
    organization: 'Uttar Pradesh Police Recruitment Board',
    description: 'Recruitment of Male and Female Constables in UP Police.',
    totalPosts: '60000+',
    qualification: '12th Pass',
    ageLimit: '18-22 years',
    salary: '₹21,700 - ₹69,100',
    status: 'new',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '15 Feb 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://uppbpb.gov.in',
    exams: ['UP Police Written Exam', 'UP Police Physical Test', 'UP Police Medical Test']
  },
  {
    id: '27',
    title: 'Maharashtra State Police Constable 2024',
    organization: 'Maharashtra Police Department',
    description: 'Recruitment of Police Constables in Maharashtra State.',
    totalPosts: '12500+',
    qualification: '12th Pass',
    ageLimit: '18-28 years',
    salary: '₹19,500 - ₹62,000',
    status: 'active',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '20 Jan 2025',
    examDate: 'March 2025',
    notificationUrl: 'https://mahapolice.gov.in',
    exams: ['Maharashtra Police Written Test', 'Physical Endurance Test', 'Medical Examination']
  },
  {
    id: '28',
    title: 'Delhi Police Constable Recruitment 2024',
    organization: 'Staff Selection Commission Delhi Police',
    description: 'For recruitment of Constable (Executive) Male & Female in Delhi Police.',
    totalPosts: '7000+',
    qualification: '12th Pass',
    ageLimit: '18-25 years',
    salary: '₹21,700 - ₹69,100',
    status: 'active',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '30 Jan 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://delhipolice.gov.in',
    exams: ['Delhi Police CBT', 'Physical Efficiency Test', 'Medical Examination']
  },
  {
    id: '29',
    title: 'Karnataka PSC Group C Recruitment 2024',
    organization: 'Karnataka Public Service Commission',
    description: 'For recruitment to various Group C posts in Karnataka State Government.',
    totalPosts: '3500+',
    qualification: '10th/12th/Graduation',
    ageLimit: '18-35 years',
    salary: '₹18,000 - ₹56,900',
    status: 'new',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '25 Jan 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://kpsc.kar.nic.in',
    exams: ['KPSC Group C Written Exam', 'KPSC Skill Test']
  },
  {
    id: '30',
    title: 'Tamil Nadu TRB Teacher Recruitment 2024',
    organization: 'Teachers Recruitment Board Tamil Nadu',
    description: 'For recruitment of Post Graduate Assistants and Physical Education Directors.',
    totalPosts: '4000+',
    qualification: 'Post Graduation + B.Ed',
    ageLimit: '21-57 years',
    salary: '₹36,900 - ₹1,16,600',
    status: 'active',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '5 Feb 2025',
    examDate: 'June 2025',
    notificationUrl: 'https://trb.tn.gov.in',
    exams: ['TRB PG TRB Written Exam', 'TRB Certificate Verification']
  },
  {
    id: '31',
    title: 'West Bengal School Service Commission (WBSSC) TET 2024',
    organization: 'West Bengal Board of Primary Education',
    description: 'West Bengal Primary TET for recruitment of Primary Teachers.',
    totalPosts: '15000+',
    qualification: 'Graduation + D.El.Ed',
    ageLimit: '18-40 years',
    salary: '₹22,000 - ₹70,000',
    status: 'new',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '10 Feb 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://wbssc.gov.in',
    exams: ['WB Primary TET', 'WBSSC Interview']
  },
  {
    id: '32',
    title: 'Rajasthan Patwari Recruitment 2024',
    organization: 'Rajasthan Subordinate and Ministerial Services Selection Board',
    description: 'For recruitment of Patwari posts in Revenue Department.',
    totalPosts: '4000+',
    qualification: 'Graduation',
    ageLimit: '18-40 years',
    salary: '₹20,000 - ₹65,000',
    status: 'active',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '18 Jan 2025',
    examDate: 'March 2025',
    notificationUrl: 'https://rsmssb.rajasthan.gov.in',
    exams: ['Rajasthan Patwari Written Exam', 'Document Verification']
  },
  {
    id: '33',
    title: 'Haryana HSSC Group D Recruitment 2024',
    organization: 'Haryana Staff Selection Commission',
    description: 'For recruitment to Group D posts in various Haryana Government Departments.',
    totalPosts: '18000+',
    qualification: '10th Pass',
    ageLimit: '17-42 years',
    salary: '₹16,900 - ₹53,500',
    status: 'new',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '28 Jan 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://hssc.gov.in',
    exams: ['HSSC Group D CBT', 'Physical Test', 'Document Verification']
  },
  {
    id: '34',
    title: 'Odisha Police Sub-Inspector (SI) Recruitment 2024',
    organization: 'Odisha Police',
    description: 'For recruitment of Sub-Inspectors of Police in Odisha Police.',
    totalPosts: '244',
    qualification: 'Graduation',
    ageLimit: '21-25 years',
    salary: '₹35,400 - ₹1,12,400',
    status: 'active',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '8 Feb 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://odishapolice.gov.in',
    exams: ['Odisha Police SI Prelims', 'Odisha Police SI Mains', 'Physical Test', 'Medical Exam']
  },
  {
    id: '35',
    title: 'AP State Government Teacher Recruitment (DSC) 2024',
    organization: 'Andhra Pradesh School Education Department',
    description: 'District Selection Committee for recruitment of School Assistants and SGTs.',
    totalPosts: '6000+',
    qualification: 'Graduation + B.Ed',
    ageLimit: '18-42 years',
    salary: '₹32,000 - ₹1,01,500',
    status: 'new',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '12 Feb 2025',
    examDate: 'June 2025',
    notificationUrl: 'https://aptet.apcfss.in',
    exams: ['AP DSC Written Test', 'AP DSC Document Verification']
  },
  {
    id: '36',
    title: 'Kerala PSC LGS (Last Grade Servants) 2024',
    organization: 'Kerala Public Service Commission',
    description: 'For recruitment to Last Grade Servants posts in various departments.',
    totalPosts: '2500+',
    qualification: '10th Pass',
    ageLimit: '18-36 years',
    salary: '₹19,500 - ₹62,000',
    status: 'active',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '22 Jan 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://keralapsc.gov.in',
    exams: ['Kerala PSC LGS Written Test']
  },
  {
    id: '37',
    title: 'Punjab PSSSB Clerk Recruitment 2024',
    organization: 'Punjab Subordinate Services Selection Board',
    description: 'For recruitment of Clerks in various Punjab Government Departments.',
    totalPosts: '1800+',
    qualification: 'Graduation',
    ageLimit: '18-37 years',
    salary: '₹19,900 - ₹63,200',
    status: 'new',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '16 Jan 2025',
    examDate: 'March 2025',
    notificationUrl: 'https://psssb.punjab.gov.in',
    exams: ['Punjab Clerk Written Exam', 'Punjab Clerk Typing Test']
  },
  {
    id: '38',
    title: 'Telangana TSPSC Group II Services 2024',
    organization: 'Telangana State Public Service Commission',
    description: 'For recruitment to Group-II Services in Telangana State.',
    totalPosts: '1200+',
    qualification: 'Graduation',
    ageLimit: '18-34 years',
    salary: '₹42,000 - ₹1,30,000',
    status: 'active',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '2 Feb 2025',
    examDate: 'May 2025',
    notificationUrl: 'https://tspsc.gov.in',
    exams: ['TSPSC Group-II Prelims', 'TSPSC Group-II Mains']
  },
  {
    id: '39',
    title: 'Madhya Pradesh Vyapam Sub Engineer Recruitment 2024',
    organization: 'MP Professional Examination Board (Vyapam)',
    description: 'For recruitment of Sub Engineers in various MP Government Departments.',
    totalPosts: '900+',
    qualification: 'Diploma in Engineering',
    ageLimit: '18-40 years',
    salary: '₹25,500 - ₹81,100',
    status: 'new',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '25 Jan 2025',
    examDate: 'April 2025',
    notificationUrl: 'https://peb.mp.gov.in',
    exams: ['MP Vyapam Sub Engineer Written Test', 'Document Verification']
  },
  {
    id: '40',
    title: 'Chhattisgarh PSC State Service Examination 2024',
    organization: 'Chhattisgarh Public Service Commission',
    description: 'For recruitment to State Civil Services and Allied Services.',
    totalPosts: '150+',
    qualification: 'Graduation',
    ageLimit: '21-35 years',
    salary: '₹40,000 - ₹1,35,000',
    status: 'active',
    category: 'State Government',
    type: 'All',
    applicationDeadline: '5 Feb 2025',
    examDate: 'June 2025',
    notificationUrl: 'https://psc.cg.gov.in',
    exams: ['CGPSC SSE Prelims', 'CGPSC SSE Mains', 'CGPSC Interview']
  }
];

const categories = ['All', 'UPSC', 'SSC', 'Banking', 'Railways', 'State PSC', 'State Government'];
const qualificationFilters = ['All', 'Graduation', '12th Pass', '10th Pass', 'B.E/B.Tech', 'Diploma', 'Post Graduation'];

export function JobsExplorer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedQualification, setSelectedQualification] = useState('All');
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());

  const filteredNotifications = jobNotifications.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.exams && job.exams.some(exam => exam.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    const matchesQualification = selectedQualification === 'All' || job.qualification.includes(selectedQualification);

    return matchesSearch && matchesCategory && matchesQualification;
  });

  const toggleBookmark = (jobId: string) => {
    setBookmarkedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-lg">Jobs Explorer</h2>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Subscribe to Alerts
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Government Jobs & Exams Explorer</h1>
          <p className="text-gray-600">Stay updated with latest government job notifications and exams</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs or exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={selectedQualification}
            onChange={(e) => setSelectedQualification(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {qualificationFilters.map((qual) => (
              <option key={qual} value={qual}>
                {qual === 'All' ? 'All Qualifications' : qual}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-6">
          Showing <span className="font-medium">{filteredNotifications.length}</span> job notifications
        </p>

        {/* Job Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl text-gray-900">{job.title}</h3>
                    {job.status === 'new' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs uppercase">
                        New
                      </span>
                    )}
                    {job.status === 'closed' && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs uppercase">
                        Closed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{job.organization}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{job.description}</p>

                  {/* Exams Section */}
                  {job.exams && job.exams.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Exams to be Written:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.exams.map((exam, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                          >
                            {exam}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleBookmark(job.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmarkedJobs.has(job.id)
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-400'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${bookmarkedJobs.has(job.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Posts</p>
                  <p className="text-gray-900">{job.totalPosts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Qualification</p>
                  <p className="text-gray-900">{job.qualification}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Age Limit</p>
                  <p className="text-gray-900">{job.ageLimit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Salary</p>
                  <p className="text-gray-900">{job.salary}</p>
                </div>
              </div>

              {job.applicationDeadline && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Deadline: {job.applicationDeadline}</span>
                  </div>
                  {job.examDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Exam: {job.examDate}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No job notifications found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}