import { ArrowRight, Zap } from 'lucide-react'
import React from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate()
  return (
    <div className="relative w-full md:h-[700px] h-screen bg-lightGray overflow-hidden">
      <section className=" w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-4 text-primaryBlue border border-blue-300">
                <Zap className="w-3 h-3 mr-1" />
                New: AI-powered note organization
              </Badge>
              <h1 className="text-primaryBlue text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Your thoughts, organized and accessible
                <span className="text-gray-800"> everywhere</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Capture ideas, organize thoughts, and collaborate seamlessly. The modern note-taking app that grows
                with you and keeps your ideas secure in the cloud.
              </p>
            </div>
            <div className="space-x-4">
              <Button onClick={()=>navigate('/create-todo')} size="lg" className="h-12 px-8 relative bg-primaryBlue hover:bg-blue-500">
                Start Taking Notes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 bg-white text-primaryBlue">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-primaryBlue">
              Free forever • No credit card required • 2 minutes setup
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;