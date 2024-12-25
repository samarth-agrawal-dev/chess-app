import { motion } from "framer-motion";

const DotLoader = () => {
  const dotVariants = {
    hidden: { y: 0 },
    visible: { y: -40 },
  };

  return (
    <>
      <div className="flex justify-center items-center space-x-2">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            initial="hidden"
            animate="visible"
            transition={{
              y: {
                repeat: Infinity,
                repeatType: "mirror",
                duration: 0.6,
                delay: index * 0.1, // Staggered delay for sequential animation
              },
            }}
            className="w-[20px] h-[20px] bg-white rounded-full font-extrabold"
          />
        ))}
      </div>
      <div className="text-2xl text-white text-center mt-5 font-[arial]">Connecting to an opponent...</div>
    </>
  );
};

export default DotLoader;
