import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { ReactNode, useState, useReducer } from 'react';
import { Dialog } from '@headlessui/react';
import SearchIcon from '@mui/icons-material/Search';
import ImageButton from '../components/ImageButton';

const enum ACTIONS {
	ADD_IMAGE = 'ADD_IMAGE',
	REMOVE_IMAGE = 'REMOVE_IMAGE',
	SET_IMAGES = 'SET_IMAGES',
	FILTER_IMAGES = 'FILTER_IMAGES',
}

type Image = {
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

type State = {
	images: Image[];
	imageElements: ReactNode[];
};

type Action = {
	type: ACTIONS;
	payload: Image | Image[] | string;
};

export const getStaticProps: GetStaticProps = async () => {
	const response = await fetch(
		`https://api.unsplash.com/photos/random?count=30`,
		{
			method: 'GET',
			headers: {
				'Accept-Version': 'v1',
				Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
			},
		}
	);
	const data = await response.json();

	return {
		props: { data },
	};
};

const Home: NextPage = ({ data }: InferGetStaticPropsType<GetStaticProps>) => {
	const reducer = (state: State, action: Action): State => {
		let updatedImages: Image[];
		switch (action.type) {
			case ACTIONS.ADD_IMAGE:
				updatedImages = [action.payload as Image, ...state.images];
				return {
					...state,
					images: updatedImages,
					imageElements: updatedImages.map((image: Image) => (
						<ImageButton
							key={image.id}
							image={image}
							handleClick={() => {
								setIsDeleteDialogOpen(true);
								setDeleteImageId(image.id);
							}}
						/>
					)),
				};
			case ACTIONS.REMOVE_IMAGE:
				updatedImages = state.images.filter(
					(image) => image.id !== (action.payload as string)
				);
				return {
					...state,
					images: updatedImages,
					imageElements: updatedImages.map((image: Image) => (
						<ImageButton
							key={image.id}
							image={image}
							handleClick={() => {
								setIsDeleteDialogOpen(true);
								setDeleteImageId(image.id);
							}}
						/>
					)),
				};
			case ACTIONS.SET_IMAGES:
				return {
					...state,
					images: action.payload as Image[],
				};
			case ACTIONS.FILTER_IMAGES:
				if (!(action.payload as string))
					return {
						...state,
						imageElements: state.images.map((image: Image) => (
							<ImageButton
								key={image.id}
								image={image}
								handleClick={() => {
									setIsDeleteDialogOpen(true);
									setDeleteImageId(image.id);
								}}
							/>
						)),
					};
				updatedImages = state.images.filter((image: Image) =>
					image.description
						?.toLowerCase()
						.includes((action.payload as string).toLowerCase())
				);
				return {
					...state,
					imageElements: updatedImages.map((image: Image) => (
						<ImageButton
							key={image.id}
							image={image}
							handleClick={() => {
								setIsDeleteDialogOpen(true);
								setDeleteImageId(image.id);
							}}
						/>
					)),
				};
			default:
				return state;
		}
	};

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [deleteImageId, setDeleteImageId] = useState('');

	const [state, dispatch] = useReducer(reducer, {
		images: data,
		imageElements: data.map((image: Image) => (
			<ImageButton
				key={image.id}
				image={image}
				handleClick={() => {
					setIsDeleteDialogOpen(true);
					setDeleteImageId(image.id);
				}}
			/>
		)),
	});

	return (
		<div className='min-h-screen'>
			<Head>
				<title>My Unsplash</title>
				<link rel='icon' href='/devchallenges.png' />
			</Head>

			<main className='flex w-full flex-col px-24 pb-24'>
				<header className='flex justify-between w-full items-center py-11'>
					<div className='flex items-center gap-11'>
						<Image
							className=''
							src='/my_unsplash_logo.svg'
							width={180}
							height={44}
						/>
						<label className='rounded-xl border-[1px] border-[#BDBDBD] overflow-hidden h-14 w-[300px] flex items-center px-4 gap-4 shadow-md shadow-[#BDBDBD] hover:border-2'>
							<SearchIcon className='text-[#BDBDBD]' />
							<input
								className='outline-none flex-grow font-noto-sans placeholder:text-[#BDBDBD] text-sm'
								type='search'
								placeholder='Search by name'
								onChange={(event) =>
									dispatch({
										type: ACTIONS.FILTER_IMAGES,
										payload: event.target.value,
									})
								}
							/>
						</label>
					</div>
					<button
						className='bg-[#3DB46D] w-36 h-14 rounded-xl shadow-xl shadow-[#b6dec7] text-white font-noto-sans text-sm hover:bg-[#308552] active:bg-opacity-80 transition-all'
						onClick={() => setIsAddDialogOpen(!isAddDialogOpen)}>
						Add a photo
					</button>
				</header>
				<div className='grid grid-cols-3 gap-11'>
					<div className='flex flex-col gap-11'>
						{state.imageElements.slice(
							0,
							Math.ceil(state.imageElements.length / 3)
						)}
					</div>
					<div className='flex flex-col gap-11'>
						{state.imageElements.slice(
							Math.ceil(state.imageElements.length / 3),
							Math.ceil(state.imageElements.length / 3) * 2
						)}
					</div>
					<div className='flex flex-col gap-11'>
						{state.imageElements.slice(
							Math.ceil(state.imageElements.length / 3) * 2
						)}
					</div>
				</div>

				<Dialog
					className='relative'
					open={isAddDialogOpen}
					onClose={() => setIsAddDialogOpen(false)}>
					<div className='fixed inset-0 bg-black/30 flex items-center justify-center'>
						<Dialog.Panel className='rounded-xl bg-white auto w-1/2 flex flex-col gap-6 px-8 py-6'>
							<Dialog.Title className='font-noto-sans text-2xl'>
								Add a new photo
							</Dialog.Title>
							<form
								className='flex flex-col gap-6'
								onSubmit={async (event) => {
									event.preventDefault();
									const [label, photoUrl] =
										event.target as unknown as HTMLFormElement[];
									console.log(label.value, photoUrl.value);
									const { newImageData } = await fetch(
										`/api/${photoUrl.value
											.split('/')
											.at(-1)}`
									).then((res) => res.json());
									newImageData.description = label.value;
									dispatch({
										type: ACTIONS.ADD_IMAGE,
										payload: newImageData as Image,
									});
									setIsAddDialogOpen(false);
								}}>
								<div>
									<h2 className='font-noto-sans text-sm'>
										Label
									</h2>
									<label className='border-[1px] border-[#4F4F4F] w-full h-14 rounded-xl overflow-hidden flex items-center mt-2'>
										<input
											className='outline-none placeholder:font-noto-sans text-sm placeholder:text-[#BDBDBD] px-4 w-full'
											type='text'
											placeholder='Enter a label'
										/>
									</label>
								</div>
								<div>
									<h2 className='font-noto-sans text-sm'>
										Photo URL
									</h2>
									<label className='border-[1px] border-[#4F4F4F] w-full h-14 rounded-xl overflow-hidden flex items-center mt-2'>
										<input
											className='outline-none placeholder:font-noto-sans text-sm placeholder:text-[#BDBDBD] px-4 w-full'
											type='text'
											placeholder='Enter a photo URL'
										/>
									</label>
								</div>
								<div className='flex justify-end gap-2'>
									<button
										className='text-[#BDBDBD] w-24 h-14'
										type='button'
										onClick={() =>
											setIsAddDialogOpen(false)
										}>
										Cancel
									</button>
									<button
										className='bg-[#3DB46D] w-24 h-14 rounded-xl shadow-xl shadow-[#b6dec7] text-white font-noto-sans hover:bg-[#308552] active:bg-opacity-80 transition-all'
										type='submit'>
										Submit
									</button>
								</div>
							</form>
						</Dialog.Panel>
					</div>
				</Dialog>

				<Dialog
					className='relative'
					open={isDeleteDialogOpen}
					onClose={() => setIsDeleteDialogOpen(false)}>
					<div className='fixed inset-0 bg-black/30 flex items-center justify-center'>
						<Dialog.Panel className='rounded-xl bg-white auto w-1/2 flex flex-col gap-6 px-8 py-6'>
							<Dialog.Title className='font-noto-sans text-2xl'>
								Are you sure?
							</Dialog.Title>
							<form
								className='flex flex-col gap-6'
								onSubmit={(event) => {
									event.preventDefault();
									const [password] =
										event.target as unknown as HTMLFormElement[];
									if (password.value === 'password') {
										dispatch({
											type: ACTIONS.REMOVE_IMAGE,
											payload: deleteImageId,
										});
										setIsDeleteDialogOpen(false);
									}
								}}>
								<div>
									<h2 className='font-noto-sans text-sm'>
										Password
									</h2>
									<label className='border-[1px] border-[#4F4F4F] w-full h-14 rounded-xl overflow-hidden flex items-center mt-2 relative'>
										<input
											className='outline-none placeholder:font-noto-sans text-sm placeholder:text-[#BDBDBD] px-4 w-full peer'
											type='password'
											placeholder='Enter your password'
											pattern='password'
										/>
										<p className='absolute top-0 left-4 invisible text-sm peer-invalid:visible peer-invalid:text-red-500'>
											Please enter correct password (hint:
											password)
										</p>
									</label>
								</div>
								<div className='flex justify-end gap-2'>
									<button
										className='text-[#BDBDBD] w-24 h-14'
										type='button'
										onClick={() =>
											setIsDeleteDialogOpen(false)
										}>
										Cancel
									</button>
									<button
										className='bg-[#EB5757] w-24 h-14 rounded-xl shadow-xl shadow-[#e8b1b1] text-white font-noto-sans hover:bg-[#c43636] active:bg-opacity-80 transition-all'
										type='submit'>
										Submit
									</button>
								</div>
							</form>
						</Dialog.Panel>
					</div>
				</Dialog>
			</main>
		</div>
	);
};

export default Home;
