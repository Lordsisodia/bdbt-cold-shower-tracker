import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Users, Heart, Target, Zap, MapPin, Clock, DollarSign, Send, Star, Briefcase, GraduationCap, Coffee, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';

const CareersPage: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const jobOpenings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote / San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $160k",
      description: "Join our engineering team to build beautiful, responsive user interfaces using React, TypeScript, and modern web technologies.",
      requirements: ["5+ years React/TypeScript experience", "Strong CSS/HTML skills", "Experience with modern build tools", "Passion for user experience"],
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Product Designer",
      department: "Design",
      location: "Remote / New York, NY",
      type: "Full-time",
      salary: "$95k - $125k",
      description: "Shape the future of productivity tools by designing intuitive, user-centered experiences that help people achieve their dreams.",
      requirements: ["3+ years product design experience", "Proficiency in Figma/Sketch", "Strong portfolio", "Experience with design systems"],
      posted: "1 week ago"
    },
    {
      id: 3,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$110k - $140k",
      description: "Build and maintain our cloud infrastructure, ensuring scalability, security, and reliability for our growing user base.",
      requirements: ["AWS/GCP experience", "Docker/Kubernetes knowledge", "CI/CD pipeline expertise", "Infrastructure as Code"],
      posted: "3 days ago"
    },
    {
      id: 4,
      title: "Content Marketing Manager",
      department: "Marketing",
      location: "Remote / Austin, TX",
      type: "Full-time",
      salary: "$70k - $90k",
      description: "Lead our content strategy to inspire and educate our community about personal development and team building.",
      requirements: ["3+ years content marketing", "Excellent writing skills", "SEO knowledge", "Social media expertise"],
      posted: "5 days ago"
    },
    {
      id: 5,
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      salary: "$65k - $85k",
      description: "Help our customers succeed by providing exceptional support and building lasting relationships with our user community.",
      requirements: ["2+ years customer success", "Strong communication skills", "Problem-solving mindset", "SaaS experience preferred"],
      posted: "1 week ago"
    },
    {
      id: 6,
      title: "Data Scientist",
      department: "Data",
      location: "Remote / Boston, MA",
      type: "Full-time",
      salary: "$100k - $130k",
      description: "Unlock insights from user data to improve our platform and help users achieve better outcomes through data-driven features.",
      requirements: ["Python/R expertise", "Machine learning experience", "SQL proficiency", "Statistics background"],
      posted: "4 days ago"
    }
  ];

  const departments = ['all', 'Engineering', 'Design', 'Marketing', 'Customer Success', 'Data'];

  const benefits = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance with wellness stipends"
    },
    {
      icon: <Laptop className="h-6 w-6" />,
      title: "Remote-First",
      description: "Work from anywhere with flexible hours and home office setup allowance"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Learning & Development",
      description: "Annual learning budget, conference attendance, and skill development programs"
    },
    {
      icon: <Coffee className="h-6 w-6" />,
      title: "Work-Life Balance",
      description: "Unlimited PTO, mental health days, and company-wide wellness breaks"
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Equity & Compensation",
      description: "Competitive salaries with equity packages and performance bonuses"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Building",
      description: "Regular team retreats, virtual social events, and collaboration tools"
    }
  ];

  const values = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "Purpose-Driven",
      description: "We believe in helping people achieve their dreams and build meaningful connections."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Innovation First",
      description: "We embrace new technologies and creative solutions to solve complex problems."
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "People-Centered",
      description: "Our users and team members are at the heart of everything we do."
    },
    {
      icon: <Star className="h-8 w-8 text-purple-600" />,
      title: "Excellence",
      description: "We strive for quality in our products, processes, and relationships."
    }
  ];

  const filteredJobs = selectedDepartment === 'all' 
    ? jobOpenings 
    : jobOpenings.filter(job => job.department === selectedDepartment);

  return (
    <>
      <Helmet>
        <title>Careers | BDBT - Building Dreams, Building Teams</title>
        <meta name="description" content="Join the BDBT team! Explore career opportunities, company culture, benefits, and open positions. Help us build the future of productivity and team collaboration." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <Briefcase className="h-6 w-6 text-blue-600" />
                <span className="text-sm text-gray-500">Join Our Team</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Build the Future with BDBT
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Join our mission to help people achieve their dreams and build stronger teams. 
                We're looking for passionate individuals who want to make a real impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="#open-positions" 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  View Open Positions
                </a>
                <a 
                  href="#culture" 
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Learn About Our Culture
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Company Values */}
        <section id="culture" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do and shape our company culture.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Work at BDBT?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We believe in taking care of our team so they can do their best work and live fulfilling lives.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                  </div>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="open-positions" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find your next opportunity to make an impact and grow your career with us.
              </p>
            </div>

            {/* Department Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedDepartment === dept
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dept === 'all' ? 'All Departments' : dept}
                </button>
              ))}
            </div>

            {/* Job Listings */}
            <div className="space-y-6">
              {filteredJobs.map(job => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mr-3">{job.title}</h3>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {job.department}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.type}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary}
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Key Requirements:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="lg:ml-6 flex flex-col items-end">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-2 flex items-center">
                        <Send className="h-4 w-4 mr-2" />
                        Apply Now
                      </button>
                      <span className="text-xs text-gray-500">Posted {job.posted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Briefcase className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No positions found</h3>
                <p className="text-gray-600">
                  Try selecting a different department or check back later for new opportunities.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Application Process */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Hiring Process</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We've designed our process to be transparent, efficient, and focused on getting to know you.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Application</h3>
                <p className="text-sm text-gray-600">Submit your application and tell us about yourself</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone Screen</h3>
                <p className="text-sm text-gray-600">Initial conversation with our recruiting team</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Interviews</h3>
                <p className="text-sm text-gray-600">Meet with team members and hiring managers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Offer</h3>
                <p className="text-sm text-gray-600">Join the BDBT team and start making an impact</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Don't See the Right Role?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're always looking for talented people to join our team. 
              Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:careers@bdbt.com" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Us Your Resume
              </a>
              <Link 
                to="/about" 
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Learn More About Us
              </Link>
            </div>
            <div className="mt-8 text-sm text-gray-500">
              <p>Questions about working at BDBT? Email us at <a href="mailto:careers@bdbt.com" className="text-blue-600 hover:text-blue-800 underline">careers@bdbt.com</a></p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="bg-gray-100 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <p className="text-sm text-gray-500">
                BDBT is an equal opportunity employer committed to diversity and inclusion.
              </p>
              <div className="flex space-x-4 text-sm">
                <Link to="/terms-of-service" className="text-blue-600 hover:text-blue-800 underline">
                  Terms of Service
                </Link>
                <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </Link>
                <Link to="/about" className="text-blue-600 hover:text-blue-800 underline">
                  About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareersPage;