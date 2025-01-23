// Chakra imports
import { Flex, useColorModeValue, Image } from '@chakra-ui/react';
import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand() {
	//   Chakra color mode
	let logoColor = useColorModeValue('navy.700', 'white');

	return (
		<Flex alignItems='center' flexDirection='column'>
			<Image src={'/webplugin.png'} h='90px' my='13px' />
			<HSeparator mb='20px' />
		</Flex>
	);
}

export default SidebarBrand;
