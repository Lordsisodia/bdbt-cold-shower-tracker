import { AlertCircle, ArrowLeft, FileText, Shield, Users } from 'lucide-react';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | BDBT - Building Dreams, Building Teams</title>
        <meta name="description" content="Terms of Service for BDBT platform. Learn about user agreements, service usage, intellectual property rights, and platform policies." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Home
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="text-sm text-gray-500">Legal Document</span>
              </div>
            </div>
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="mt-2 text-gray-600">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Important Notice</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Please read these Terms of Service carefully before using our platform. 
                    By accessing or using BDBT, you agree to be bound by these terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <a href="#acceptance" className="text-blue-600 hover:text-blue-800 hover:underline">1. Acceptance of Terms</a>
                <a href="#description" className="text-blue-600 hover:text-blue-800 hover:underline">2. Service Description</a>
                <a href="#eligibility" className="text-blue-600 hover:text-blue-800 hover:underline">3. User Eligibility</a>
                <a href="#accounts" className="text-blue-600 hover:text-blue-800 hover:underline">4. User Accounts</a>
                <a href="#conduct" className="text-blue-600 hover:text-blue-800 hover:underline">5. User Conduct</a>
                <a href="#content" className="text-blue-600 hover:text-blue-800 hover:underline">6. Content and Intellectual Property</a>
                <a href="#privacy" className="text-blue-600 hover:text-blue-800 hover:underline">7. Privacy and Data</a>
                <a href="#payment" className="text-blue-600 hover:text-blue-800 hover:underline">8. Payment Terms</a>
                <a href="#liability" className="text-blue-600 hover:text-blue-800 hover:underline">9. Liability and Disclaimers</a>
                <a href="#termination" className="text-blue-600 hover:text-blue-800 hover:underline">10. Termination</a>
                <a href="#changes" className="text-blue-600 hover:text-blue-800 hover:underline">11. Changes to Terms</a>
                <a href="#contact" className="text-blue-600 hover:text-blue-800 hover:underline">12. Contact Information</a>
              </div>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8">
              {/* 1. Acceptance of Terms */}
              <section id="acceptance">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  1. Acceptance of Terms
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    By accessing and using the BDBT platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                  <p>
                    These Terms of Service ("Terms") govern your use of BDBT's website, mobile applications, and related services 
                    (collectively, the "Platform") operated by BDBT ("we," "us," or "our").
                  </p>
                </div>
              </section>

              {/* 2. Service Description */}
              <section id="description">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    BDBT is a comprehensive platform designed to help individuals and teams build dreams and achieve success through:
                  </p>
                  <ul>
                    <li>Personalized tip generation and content creation tools</li>
                    <li>Team collaboration and productivity features</li>
                    <li>Goal tracking and progress monitoring</li>
                    <li>Educational content and resources</li>
                    <li>Community features and networking opportunities</li>
                  </ul>
                  <p>
                    We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with or without notice.
                  </p>
                </div>
              </section>

              {/* 3. User Eligibility */}
              <section id="eligibility">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Eligibility</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    You must be at least 13 years old to use our Service. If you are between 13 and 18 years old, 
                    you may only use the Service with the consent and supervision of a parent or legal guardian.
                  </p>
                  <p>
                    By using our Service, you represent and warrant that:
                  </p>
                  <ul>
                    <li>You have the legal capacity to enter into these Terms</li>
                    <li>Your use of the Service will not violate any applicable law or regulation</li>
                    <li>You will not use the Service for any unlawful or unauthorized purpose</li>
                  </ul>
                </div>
              </section>

              {/* 4. User Accounts */}
              <section id="accounts">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    To access certain features of the Service, you may need to create an account. You agree to:
                  </p>
                  <ul>
                    <li>Provide accurate, current, and complete information during registration</li>
                    <li>Maintain and update your account information</li>
                    <li>Keep your password secure and confidential</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                    <li>Accept responsibility for all activities that occur under your account</li>
                  </ul>
                  <p>
                    We reserve the right to suspend or terminate accounts that violate these Terms or are used for fraudulent purposes.
                  </p>
                </div>
              </section>

              {/* 5. User Conduct */}
              <section id="conduct">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Conduct</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    You agree not to use the Service to:
                  </p>
                  <ul>
                    <li>Violate any applicable laws, regulations, or third-party rights</li>
                    <li>Upload, post, or transmit harmful, offensive, or inappropriate content</li>
                    <li>Engage in harassment, abuse, or discriminatory behavior</li>
                    <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                    <li>Distribute spam, malware, or other malicious content</li>
                    <li>Impersonate others or provide false information</li>
                    <li>Interfere with the proper functioning of the Service</li>
                  </ul>
                </div>
              </section>

              {/* 6. Content and Intellectual Property */}
              <section id="content">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Content and Intellectual Property</h2>
                <div className="prose prose-gray max-w-none">
                  <h3 className="text-lg font-medium text-gray-900">Our Content</h3>
                  <p>
                    All content, features, and functionality of the Service, including but not limited to text, graphics, logos, 
                    images, software, and design, are owned by BDBT and are protected by copyright, trademark, and other intellectual property laws.
                  </p>
                  
                  <h3 className="text-lg font-medium text-gray-900">User Content</h3>
                  <p>
                    You retain ownership of content you create and share through the Service ("User Content"). 
                    By submitting User Content, you grant BDBT a worldwide, non-exclusive, royalty-free license to use, 
                    modify, display, and distribute your content in connection with the Service.
                  </p>
                  
                  <p>
                    You represent that your User Content:
                  </p>
                  <ul>
                    <li>Does not infringe on any third-party rights</li>
                    <li>Complies with applicable laws and these Terms</li>
                    <li>Is accurate and not misleading</li>
                  </ul>
                </div>
              </section>

              {/* 7. Privacy and Data */}
              <section id="privacy">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Your privacy is important to us. Our collection and use of personal information is governed by our 
                    <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link>, 
                    which is incorporated into these Terms by reference.
                  </p>
                  <p>
                    By using the Service, you consent to our collection, use, and disclosure of your information as described in the Privacy Policy.
                  </p>
                </div>
              </section>

              {/* 8. Payment Terms */}
              <section id="payment">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Payment Terms</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Some features of the Service may require payment. By purchasing premium features, you agree to:
                  </p>
                  <ul>
                    <li>Pay all fees and charges associated with your account</li>
                    <li>Provide accurate billing information</li>
                    <li>Update payment information as needed</li>
                    <li>Accept that fees are non-refundable except as required by law</li>
                  </ul>
                  <p>
                    We reserve the right to change our pricing at any time with reasonable notice to existing subscribers.
                  </p>
                </div>
              </section>

              {/* 9. Liability and Disclaimers */}
              <section id="liability">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Liability and Disclaimers</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, 
                    EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, BDBT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                    SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                  </p>
                  <p>
                    OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATING TO THE SERVICE SHALL NOT EXCEED 
                    THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.
                  </p>
                </div>
              </section>

              {/* 10. Termination */}
              <section id="termination">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
                  </p>
                  <p>
                    We may suspend or terminate your access to the Service at any time, with or without cause, 
                    including if you violate these Terms or engage in conduct that we deem harmful to the Service or other users.
                  </p>
                  <p>
                    Upon termination, your right to use the Service will cease immediately, 
                    and we may delete your account and associated data after a reasonable period.
                  </p>
                </div>
              </section>

              {/* 11. Changes to Terms */}
              <section id="changes">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    We may update these Terms from time to time. When we make material changes, 
                    we will notify you by email or through the Service at least 30 days before the changes take effect.
                  </p>
                  <p>
                    Your continued use of the Service after the effective date of any changes constitutes your acceptance of the new Terms.
                  </p>
                </div>
              </section>

              {/* 12. Contact Information */}
              <section id="contact">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  12. Contact Information
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><strong>Email:</strong> legal@bdbt.com</p>
                    <p className="mb-2"><strong>Website:</strong> <a href="https://bdbt.com/contact" className="text-blue-600 hover:text-blue-800 underline">bdbt.com/contact</a></p>
                    <p><strong>Address:</strong> BDBT Legal Department<br />
                    [Your Business Address]<br />
                    [City, State, ZIP Code]</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-sm text-gray-500">
                  These Terms of Service are effective as of {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="flex space-x-4 text-sm">
                  <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
                    Privacy Policy
                  </Link>
                  <Link to="/careers" className="text-blue-600 hover:text-blue-800 underline">
                    Careers
                  </Link>
                  <Link to="/about" className="text-blue-600 hover:text-blue-800 underline">
                    About Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfServicePage;