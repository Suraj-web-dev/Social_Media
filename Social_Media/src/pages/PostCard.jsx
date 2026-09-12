import React, { useState } from 'react'
import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

const PostCard = ({ post }) => {
  const navigate = useNavigate()
  const [likes, setLikes] = useState(post.likes_count || [])
  const [isLiked, setIsLiked] = useState(false)
 
  const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>')
  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev.slice(0, -1))
      setIsLiked(false)
    } else {
      setLikes(prev => [...prev, 'user_current'])
      setIsLiked(true)
    }
  }

  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl border border-gray-100'>
      {/* User Info Header */}
      <div onClick={()=>navigate("/profile/" + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer'>
        <img
          src={post.user?.profile_picture}
          alt={post.user?.full_name}
          className='w-10 h-10 rounded-full object-cover shadow'
        />
        <div>
          <div className='flex items-center space-x-1'>
            <span className='font-semibold text-gray-800'>{post.user?.full_name}</span>
            {post.user?.is_verified && (
              <BadgeCheck className='w-4 h-4 text-blue-500' />
            )}
          </div>
          <div className='text-gray-500 text-xs'>
            @{post.user?.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Post Text Content */}
      {post.content && (
        <p className='text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-line' dangerouslySetInnerHTML={{__html:postWithHashtags}}>
         
        </p>
      )}

      {/* Post Image(s) */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className='rounded-lg overflow-hidden border border-gray-100 max-h-112.5 bg-gray-50 flex items-center justify-center'>
          <img
            src={post.image_urls[0]}
            alt="post attachment"
            className='w-full h-auto max-h-112.5 object-cover'
          />
        </div>
      )}

      {/* Action Buttons (Like, Comment, Share) */}
      <div className='flex items-center justify-between pt-2 border-t border-gray-100 text-gray-600 text-sm'>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 cursor-pointer transition ${
            isLiked ? 'text-red-500 font-semibold' : 'hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{likes.length} Likes</span>
        </button>

        <button className='flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer transition'>
          <MessageCircle className='w-5 h-5' />
          <span>Comments</span>
        </button>

        <button className='flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer transition'>
          <Share2 className='w-5 h-5' />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}

export default PostCard