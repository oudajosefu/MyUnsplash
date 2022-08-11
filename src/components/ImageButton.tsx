import Image from 'next/image';

interface Props {
	image: {
		id: string;
		urls: {
			regular: string;
		};
		description: string;
		width: number;
		height: number;
		links: {
			html: string;
		};
	};
	handleClick: () => void;
}
const ImageButton = ({ image, handleClick }: Props) => {
	return (
		<div className='relative group rounded-3xl overflow-hidden flex shadow-xl shadow-[#888888]'>
			<Image
				className='rounded-3xl'
				src={image.urls.regular}
				alt={image.description}
				width={image.width}
				height={image.height}
			/>
			<a href={image.links.html}>
				<div className='absolute top-0 right-0 invisible h-full w-full group-hover:visible group-hover:bg-black group-hover:bg-opacity-[38%] flex flex-col justify-end items-start p-4 pb-8 transition-all duration-500'>
					<h1 className='text-lg text-white font-noto-sans invisible group-hover:visible'>
						{image.description
							? image.description
							: 'No description'}
					</h1>
				</div>
			</a>
			<button
				className='absolute rounded-xl border-[1px] border-[#EB5757] text-[#EB5757] px-4 py-1 hover:bg-red-400 hover:bg-opacity-50 invisible group-hover:visible self-end text-xs top-4 right-4'
				onClick={handleClick}>
				delete
			</button>
		</div>
	);
};
export default ImageButton;
