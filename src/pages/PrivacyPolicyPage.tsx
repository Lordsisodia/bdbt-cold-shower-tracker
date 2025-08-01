import { ArrowLeft, Cookie, Database, Eye, Globe, Lock, Shield, UserCheck } from 'lucide-react';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | BDBT - Building Dreams, Building Teams</title>
        <meta name="description" content="Privacy Policy for BDBT platform. Learn how we collect, use, store, and protect your personal information and data privacy rights." />
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
                <Shield className="h-6 w-6 text-green-600" />
                <span className="text-sm text-gray-500">Privacy Protected</span>
              </div>
            </div>
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
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
            {/* Privacy Commitment */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Our Privacy Commitment</h3>
                  <p className="mt-1 text-sm text-green-700">
                    At BDBT, we are committed to protecting your privacy and ensuring the security of your personal information. 
                    This policy explains how we collect, use, and safeguard your data.
                  </p>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <a href="#overview" className="text-blue-600 hover:text-blue-800 hover:underline">1. Overview</a>
                <a href="#information-collection" className="text-blue-600 hover:text-blue-800 hover:underline">2. Information We Collect</a>
                <a href="#information-use" className="text-blue-600 hover:text-blue-800 hover:underline">3. How We Use Information</a>
                <a href="#information-sharing" className="text-blue-600 hover:text-blue-800 hover:underline">4. Information Sharing</a>
                <a href="#data-storage" className="text-blue-600 hover:text-blue-800 hover:underline">5. Data Storage & Security</a>
                <a href="#cookies" className="text-blue-600 hover:text-blue-800 hover:underline">6. Cookies & Tracking</a>
                <a href="#user-rights" className="text-blue-600 hover:text-blue-800 hover:underline">7. Your Rights & Choices</a>
                <a href="#international" className="text-blue-600 hover:text-blue-800 hover:underline">8. International Transfers</a>
                <a href="#children" className="text-blue-600 hover:text-blue-800 hover:underline">9. Children's Privacy</a>
                <a href="#changes" className="text-blue-600 hover:text-blue-800 hover:underline">10. Policy Changes</a>
                <a href="#contact" className="text-blue-600 hover:text-blue-800 hover:underline">11. Contact Us</a>
              </div>
            </div>

            {/* Privacy Sections */}
            <div className="space-y-8">
              {/* 1. Overview */}
              <section id="overview">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-6 w-6 text-blue-600 mr-2" />
                  1. Overview
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    This Privacy Policy describes how BDBT ("we," "us," or "our") collects, uses, and shares information 
                    when you use our platform, website, and related services (collectively, the "Service").
                  </p>
                  <p>
                    We respect your privacy and are committed to protecting your personal information. 
                    This policy explains our practices regarding the collection, use, and disclosure of information 
                    that you may provide through our Service.
                  </p>
                  <p>
                    By using our Service, you agree to the collection and use of information in accordance with this policy.
                  </p>
                </div>
              </section>

              {/* 2. Information We Collect */}
              <section id="information-collection">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Database className="h-6 w-6 text-purple-600 mr-2" />
                  2. Information We Collect
                </h2>
                <div className="prose prose-gray max-w-none">
                  <h3 className="text-lg font-medium text-gray-900">Information You Provide</h3>
                  <ul>
                    <li><strong>Account Information:</strong> Name, email address, username, password, and profile information</li>
                    <li><strong>Content:</strong> Tips, goals, posts, comments, and other content you create or share</li>
                    <li><strong>Communication:</strong> Messages, feedback, and correspondence with us</li>
                    <li><strong>Payment Information:</strong> Billing details for premium features (processed securely by third-party providers)</li>
                    <li><strong>Profile Data:</strong> Preferences, settings, and customization choices</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Information We Collect Automatically</h3>
                  <ul>
                    <li><strong>Usage Data:</strong> How you interact with our Service, features used, time spent, and navigation patterns</li>
                    <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address, and unique device identifiers</li>
                    <li><strong>Location Data:</strong> General location information (city/region level) based on IP address</li>
                    <li><strong>Performance Data:</strong> Error logs, crash reports, and performance metrics</li>
                    <li><strong>Analytics Data:</strong> Aggregated usage statistics and behavioral patterns</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Information from Third Parties</h3>
                  <ul>
                    <li><strong>Social Media:</strong> Profile information when you connect social media accounts</li>
                    <li><strong>Authentication:</strong> Information from third-party login providers (Google, Facebook, etc.)</li>
                    <li><strong>Integrations:</strong> Data from connected third-party services and applications</li>
                  </ul>
                </div>
              </section>

              {/* 3. How We Use Information */}
              <section id="information-use">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Information</h2>
                <div className="prose prose-gray max-w-none">
                  <p>We use the information we collect to:</p>
                  
                  <h3 className="text-lg font-medium text-gray-900">Provide and Improve Our Service</h3>
                  <ul>
                    <li>Create and manage your account</li>
                    <li>Deliver personalized content and recommendations</li>
                    <li>Process transactions and provide customer support</li>
                    <li>Analyze usage patterns to improve our platform</li>
                    <li>Develop new features and functionality</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Communication</h3>
                  <ul>
                    <li>Send important updates about your account or our Service</li>
                    <li>Respond to your inquiries and provide support</li>
                    <li>Send promotional communications (with your consent)</li>
                    <li>Notify you about new features or changes to our Service</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Safety and Security</h3>
                  <ul>
                    <li>Detect and prevent fraud, abuse, and security threats</li>
                    <li>Enforce our Terms of Service and community guidelines</li>
                    <li>Protect the rights and safety of our users and the public</li>
                    <li>Comply with legal obligations and law enforcement requests</li>
                  </ul>
                </div>
              </section>

              {/* 4. Information Sharing */}
              <section id="information-sharing">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
                <div className="prose prose-gray max-w-none">
                  <p>We do not sell your personal information. We may share information in the following circumstances:</p>
                  
                  <h3 className="text-lg font-medium text-gray-900">With Your Consent</h3>
                  <p>We share information when you explicitly consent to such sharing.</p>

                  <h3 className="text-lg font-medium text-gray-900">Service Providers</h3>
                  <p>We work with trusted third-party service providers who help us operate our platform:</p>
                  <ul>
                    <li>Cloud hosting and infrastructure providers</li>
                    <li>Payment processors and billing services</li>
                    <li>Analytics and monitoring services</li>
                    <li>Customer support and communication tools</li>
                    <li>Security and fraud prevention services</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Legal Requirements</h3>
                  <p>We may disclose information when required by law or to:</p>
                  <ul>
                    <li>Comply with legal processes or government requests</li>
                    <li>Protect our rights, property, or safety</li>
                    <li>Prevent fraud or abuse</li>
                    <li>Respond to emergencies involving personal safety</li>
                  </ul>
                </div>
              </section>

              {/* 5. Data Storage & Security */}
              <section id="data-storage">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-6 w-6 text-red-600 mr-2" />
                  5. Data Storage & Security
                </h2>
                <div className="prose prose-gray max-w-none">
                  <h3 className="text-lg font-medium text-gray-900">Security Measures</h3>
                  <p>We implement industry-standard security measures to protect your information:</p>
                  <ul>
                    <li>Encryption of data in transit and at rest</li>
                    <li>Secure authentication and access controls</li>
                    <li>Regular security audits and monitoring</li>
                    <li>Employee training on data protection practices</li>
                    <li>Incident response and breach notification procedures</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Data Retention</h3>
                  <p>We retain your information for as long as necessary to:</p>
                  <ul>
                    <li>Provide our services to you</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes and enforce agreements</li>
                    <li>Improve our services</li>
                  </ul>
                  <p>
                    When you delete your account, we will delete or anonymize your personal information within 30 days, 
                    unless we are required to retain it for legal purposes.
                  </p>

                  <h3 className="text-lg font-medium text-gray-900">Data Location</h3>
                  <p>
                    Your information is stored on secure servers located in the United States and may be processed 
                    in other countries where our service providers operate.
                  </p>
                </div>
              </section>

              {/* 6. Cookies & Tracking */}
              <section id="cookies">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Cookie className="h-6 w-6 text-orange-600 mr-2" />
                  6. Cookies & Tracking Technologies
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p>We use cookies and similar tracking technologies to enhance your experience:</p>
                  
                  <h3 className="text-lg font-medium text-gray-900">Types of Cookies We Use</h3>
                  <ul>
                    <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                    <li><strong>Performance Cookies:</strong> Help us understand how you use our Service</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                    <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with consent)</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Third-Party Analytics</h3>
                  <p>We use analytics services like Google Analytics to understand user behavior. These services may collect:</p>
                  <ul>
                    <li>Pages visited and time spent on pages</li>
                    <li>Traffic sources and referral information</li>
                    <li>Device and browser information</li>
                    <li>General location data</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Managing Cookies</h3>
                  <p>
                    You can control cookies through your browser settings or our cookie preference center. 
                    Note that disabling certain cookies may limit some functionality of our Service.
                  </p>
                </div>
              </section>

              {/* 7. Your Rights & Choices */}
              <section id="user-rights">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <UserCheck className="h-6 w-6 text-indigo-600 mr-2" />
                  7. Your Rights & Choices
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p>You have the following rights regarding your personal information:</p>
                  
                  <h3 className="text-lg font-medium text-gray-900">Access and Portability</h3>
                  <ul>
                    <li>Request a copy of your personal information</li>
                    <li>Export your data in a machine-readable format</li>
                    <li>Access your account settings and privacy controls</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Correction and Updates</h3>
                  <ul>
                    <li>Update your profile and account information</li>
                    <li>Correct inaccurate personal information</li>
                    <li>Modify your privacy preferences</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Deletion and Restriction</h3>
                  <ul>
                    <li>Delete specific content or information</li>
                    <li>Request account deletion</li>
                    <li>Restrict certain types of data processing</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-900">Communication Preferences</h3>
                  <ul>
                    <li>Opt out of marketing communications</li>
                    <li>Manage notification settings</li>
                    <li>Control promotional messages</li>
                  </ul>

                  <p>
                    To exercise these rights, contact us at privacy@bdbt.com or use the settings in your account dashboard.
                  </p>
                </div>
              </section>

              {/* 8. International Transfers */}
              <section id="international">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-6 w-6 text-green-600 mr-2" />
                  8. International Data Transfers
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    BDBT operates globally, and your information may be transferred to and processed in countries 
                    other than your country of residence, including the United States.
                  </p>
                  <p>
                    When we transfer personal information internationally, we ensure appropriate safeguards are in place, including:
                  </p>
                  <ul>
                    <li>Adequacy decisions by relevant data protection authorities</li>
                    <li>Standard contractual clauses approved by regulatory bodies</li>
                    <li>Certification under privacy frameworks like Privacy Shield (where applicable)</li>
                    <li>Other legally approved transfer mechanisms</li>
                  </ul>
                </div>
              </section>

              {/* 9. Children's Privacy */}
              <section id="children">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Our Service is not intended for children under 13 years of age. We do not knowingly collect 
                    personal information from children under 13.
                  </p>
                  <p>
                    If you are a parent or guardian and believe your child has provided us with personal information, 
                    please contact us immediately. We will take steps to delete such information from our systems.
                  </p>
                  <p>
                    For users between 13 and 18 years old, we recommend parental guidance when using our Service, 
                    and we may require parental consent for certain features.
                  </p>
                </div>
              </section>

              {/* 10. Changes to Privacy Policy */}
              <section id="changes">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes in our practices, 
                    technology, legal requirements, or other factors.
                  </p>
                  <p>
                    When we make material changes, we will:
                  </p>
                  <ul>
                    <li>Notify you by email or through our Service</li>
                    <li>Update the "Last Updated" date at the top of this policy</li>
                    <li>Provide at least 30 days' notice before changes take effect</li>
                    <li>Obtain your consent for material changes where required by law</li>
                  </ul>
                  <p>
                    We encourage you to review this Privacy Policy periodically to stay informed about our privacy practices.
                  </p>
                </div>
              </section>

              {/* 11. Contact Us */}
              <section id="contact">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, 
                    please contact us:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><strong>Privacy Officer:</strong> privacy@bdbt.com</p>
                    <p className="mb-2"><strong>General Inquiries:</strong> support@bdbt.com</p>
                    <p className="mb-2"><strong>Data Protection Requests:</strong> data-protection@bdbt.com</p>
                    <p className="mb-2"><strong>Website:</strong> <a href="https://bdbt.com/privacy" className="text-blue-600 hover:text-blue-800 underline">bdbt.com/privacy</a></p>
                    <p><strong>Mailing Address:</strong><br />
                    BDBT Privacy Department<br />
                    [Your Business Address]<br />
                    [City, State, ZIP Code]</p>
                  </div>
                  <p className="mt-4">
                    We will respond to your privacy-related inquiries within 30 days of receipt.
                  </p>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-sm text-gray-500">
                  This Privacy Policy is effective as of {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="flex space-x-4 text-sm">
                  <Link to="/terms-of-service" className="text-blue-600 hover:text-blue-800 underline">
                    Terms of Service
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

export default PrivacyPolicyPage;