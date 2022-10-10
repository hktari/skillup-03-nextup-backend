import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { AppDataSource } from '../data-source'

(async () => {
    try {
        console.log('start seeding...')
        const dataSourceInit = await AppDataSource.initialize();
        await runSeeders(dataSourceInit);
        console.log('finished seeding...')
        await new Promise((resolve, reject) => {
            setTimeout(() => resolve(true), 1000)
        })
        process.exit(0)
    } catch (error) {
        console.error('Error occured', error.toString())
    }
})();
